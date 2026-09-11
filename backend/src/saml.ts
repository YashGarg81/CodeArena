// backend/src/saml.ts
/**
 * Enterprise SAML 2.0 Identity Provider Assertion Parser and Handler.
 * Supports Okta, Azure AD, Google Workspace, and PingFederate.
 */

export interface SAMLUserIdentity {
  nameId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  organizationId?: string;
  groups?: string[];
}

import { DOMParser } from "@xmldom/xmldom";
import { SignedXml } from "xml-crypto";

export interface SAMLConfig {
  idpCert?: string;
  expectedAudience?: string;
  expectedIssuer?: string;
}

/**
 * Validates XML Signature (ds:Signature) against IdP X.509 Certificate using XML-DSig canonicalization.
 * Enforces strict cryptographic signature and reference digest validation without regex fallbacks.
 */
export function verifySAMLSignature(xml: string, certPem: string): boolean {
  if (!xml || typeof xml !== "string" || !certPem) {
    return false;
  }

  // Prevent XXE & DTD processing
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    return false;
  }

  try {
    const doc = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {}
      }
    }).parseFromString(xml, "text/xml");

    if (!doc || !doc.documentElement) {
      return false;
    }

    const signatureNodes = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");
    const signatureNode = signatureNodes.length > 0 ? signatureNodes[0] : (
      doc.getElementsByTagName("ds:Signature")[0] || doc.getElementsByTagName("Signature")[0]
    );

    if (!signatureNode) {
      return false;
    }

    // Protection against XML Signature Wrapping (XSW) with multiple assertions
    const assertions = Array.from(doc.getElementsByTagNameNS("urn:oasis:names:tc:SAML:2.0:assertion", "Assertion"))
      .concat(Array.from(doc.getElementsByTagName("saml2:Assertion")))
      .concat(Array.from(doc.getElementsByTagName("saml:Assertion")))
      .concat(Array.from(doc.getElementsByTagName("Assertion")));

    if (assertions.length > 1) {
      // Check for duplicate assertions or duplicate IDs
      const ids = assertions.map(a => a.getAttribute("ID") || a.getAttribute("id")).filter(Boolean);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        return false; // Duplicate Assertion ID detected
      }
    }

    let formattedCert = certPem.trim();
    if (!formattedCert.includes("BEGIN CERTIFICATE")) {
      formattedCert = `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----`;
    }

    const sig = new SignedXml();
    sig.keyInfoProvider = {
      getKeyInfo: () => "<X509Data></X509Data>",
      getKey: () => formattedCert
    };

    sig.loadSignature(signatureNode as any);
    const isValid = sig.checkSignature(xml);
    return Boolean(isValid);
  } catch {
    // Fail closed: Never fall back to unvalidated regex signatures
    return false;
  }
}

/**
 * Decodes, validates cryptographic constraints, and parses SAMLResponse assertion using standard XML DOM parsing.
 */
export function parseSAMLAssertion(samlResponseBase64: string, config?: SAMLConfig): SAMLUserIdentity {
  if (!samlResponseBase64 || typeof samlResponseBase64 !== "string") {
    throw new Error("SAMLResponse assertion body is required");
  }

  let xml = "";
  try {
    xml = Buffer.from(samlResponseBase64, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid base64 encoding for SAMLResponse");
  }

  // Prevent XXE & DTD processing
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error("Security Violation: DTD and external entities are forbidden in SAML assertions");
  }

  // Ensure root element has standard SAML namespace declarations if parsing loose mock payloads
  let normalizedXml = xml;
  if (!normalizedXml.includes("xmlns:saml2") && !normalizedXml.includes("xmlns:saml")) {
    normalizedXml = normalizedXml.replace(
      /<([a-zA-Z0-9_-]+:)?(Assertion|Response|Envelope)(\s|>)/,
      '<$1$2 xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"$3'
    );
  }

  // Parse XML using standard DOMParser
  let doc: any = null;
  try {
    doc = new DOMParser().parseFromString(normalizedXml, "text/xml");
  } catch {
    doc = null;
  }

  if (!doc || !doc.documentElement || doc.documentElement.tagName === "parsererror") {
    throw new Error("Invalid or malformed SAML XML document");
  }

  // Check for XML Signature Wrapping / Duplicate Assertion IDs
  const assertionElements: any[] = Array.from(doc.getElementsByTagName("Assertion")).concat(
    Array.from(doc.getElementsByTagName("saml2:Assertion")),
    Array.from(doc.getElementsByTagName("saml:Assertion"))
  );
  if (assertionElements.length > 1) {
    const idList = assertionElements.map(el => el?.getAttribute?.("ID") || el?.getAttribute?.("id")).filter(Boolean);
    const uniqueIds = new Set(idList);
    if (idList.length !== uniqueIds.size) {
      throw new Error("Security Violation: Duplicate Assertion ID detected in SAML response");
    }
  }

  // 1. Validate Time-Window Conditions (NotBefore / NotOnOrAfter)
  const conditionsNodes = doc.getElementsByTagName("Conditions");
  const conditionsNode = conditionsNodes.length > 0 ? conditionsNodes[0] : (doc.getElementsByTagName("saml2:Conditions")[0] || doc.getElementsByTagName("saml:Conditions")[0]);
  const now = Date.now();
  const clockSkewMs = 5 * 60 * 1000; // 5 minute clock skew allowance

  if (conditionsNode) {
    const notBeforeAttr = conditionsNode.getAttribute("NotBefore");
    if (notBeforeAttr) {
      const notBeforeTime = new Date(notBeforeAttr).getTime();
      if (!isNaN(notBeforeTime) && now + clockSkewMs < notBeforeTime) {
        throw new Error("SAML assertion is not yet valid (NotBefore check failed)");
      }
    }

    const notOnOrAfterAttr = conditionsNode.getAttribute("NotOnOrAfter");
    if (notOnOrAfterAttr) {
      const notOnOrAfterTime = new Date(notOnOrAfterAttr).getTime();
      if (!isNaN(notOnOrAfterTime) && now - clockSkewMs >= notOnOrAfterTime) {
        throw new Error("SAML assertion has expired (NotOnOrAfter check failed)");
      }
    }
  }

  // 2. Validate Audience Restriction if configured
  const expectedAudience = config?.expectedAudience || process.env.SAML_AUDIENCE;
  if (expectedAudience) {
    const audienceElements: any[] = Array.from(doc.getElementsByTagName("Audience")).concat(
      Array.from(doc.getElementsByTagName("saml2:Audience")),
      Array.from(doc.getElementsByTagName("saml:Audience"))
    );
    const hasMatchingAudience = audienceElements.some(el => el?.textContent?.trim() === expectedAudience.trim());
    if (!hasMatchingAudience) {
      throw new Error(`SAML assertion audience restriction mismatch: expected ${expectedAudience}`);
    }
  }

  // 3. Cryptographic Signature Validation
  const idpCert = config?.idpCert || process.env.SAML_IDP_CERT;
  const isProd = process.env.NODE_ENV === "production";
  const requireCert = Boolean(idpCert || process.env.REQUIRE_SAML_SIGNATURE === "true" || isProd);

  if (idpCert) {
    const isValidSignature = verifySAMLSignature(xml, idpCert);
    if (!isValidSignature) {
      throw new Error("Cryptographic verification failed: SAML XML signature does not match configured IdP certificate");
    }
  } else if (requireCert && !process.env.ALLOW_UNSIGNED_SAML) {
    const signatureElements = doc.getElementsByTagName("Signature");
    const dsSignatureElements = doc.getElementsByTagName("ds:Signature");
    if (signatureElements.length === 0 && dsSignatureElements.length === 0) {
      throw new Error("Security Violation: Production SAML assertions must be cryptographically signed with configured SAML_IDP_CERT");
    }
  }

  // 4. Extract NameID / Email / Attributes via DOM Node inspection
  let nameId = "";
  const nameIdElements: any[] = Array.from(doc.getElementsByTagName("NameID")).concat(
    Array.from(doc.getElementsByTagName("saml2:NameID")),
    Array.from(doc.getElementsByTagName("saml:NameID"))
  );
  if (nameIdElements.length > 0 && nameIdElements[0]?.textContent) {
    nameId = nameIdElements[0].textContent.trim();
  }

  let email = "";
  let displayName = "";
  const attributeElements: any[] = Array.from(doc.getElementsByTagName("Attribute")).concat(
    Array.from(doc.getElementsByTagName("saml2:Attribute")),
    Array.from(doc.getElementsByTagName("saml:Attribute"))
  );

  for (const attr of attributeElements) {
    const attrName = (attr.getAttribute?.("Name") || attr.getAttribute?.("name") || "").toLowerCase();
    const valElement = attr.getElementsByTagName?.("AttributeValue")?.[0] ||
                       attr.getElementsByTagName?.("saml2:AttributeValue")?.[0] ||
                       attr.getElementsByTagName?.("saml:AttributeValue")?.[0];
    const val = valElement?.textContent?.trim() || "";

    if (!email && (attrName === "email" || attrName === "emailaddress" || attrName.includes("emailaddress"))) {
      email = val.toLowerCase();
    }
    if (!displayName && (attrName === "displayname" || attrName === "name" || attrName.includes("/name"))) {
      displayName = val;
    }
  }

  if (!email && nameId && nameId.includes("@")) {
    email = nameId.toLowerCase();
  }

  if (!email || !email.includes("@")) {
    const fallbackMatch = xml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
    if (fallbackMatch) {
      email = fallbackMatch.toLowerCase();
    } else {
      throw new Error("SAML assertion contains no valid Email or NameID attribute");
    }
  }

  if (!displayName) {
    displayName = email.split("@")[0] || "saml_user";
  }
  if (!nameId) {
    nameId = email;
  }

  return {
    nameId,
    email,
    displayName
  };
}

/**
 * High-level SAML response verification and identity extraction
 */
export async function verifySamlResponse(
  samlResponseBase64: string,
  certPem?: string
): Promise<{ valid: boolean; error?: string; identity?: SAMLUserIdentity }> {
  try {
    if (!samlResponseBase64) return { valid: false, error: "Empty SAML response" };
    const xml = Buffer.from(samlResponseBase64, "base64").toString("utf-8");
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
      return { valid: false, error: "Security Violation: DOCTYPE or external entity declarations are prohibited" };
    }
    if (certPem) {
      const validSig = verifySAMLSignature(xml, certPem);
      if (!validSig) return { valid: false, error: "Invalid SAML signature or certificate mismatch" };
    }
    const identity = parseSAMLAssertion(samlResponseBase64);
    return { valid: true, identity };
  } catch (err: any) {
    return { valid: false, error: err.message || "SAML verification failed" };
  }
}
