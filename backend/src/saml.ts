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

import crypto from "crypto";

export interface SAMLConfig {
  idpCert?: string;
  expectedAudience?: string;
  expectedIssuer?: string;
}

/**
 * Validates XML Signature (ds:Signature) against IdP X.509 Certificate.
 */
export function verifySAMLSignature(xml: string, certPem: string): boolean {
  try {
    const sigValueMatch = xml.match(/<(?:ds:)?SignatureValue[^>]*>([^<]+)<\/(?:ds:)?SignatureValue>/i);
    const signedInfoMatch = xml.match(/<(?:ds:)?SignedInfo[\s\S]*?<\/(?:ds:)?SignedInfo>/i);

    if (!sigValueMatch || !sigValueMatch[1] || !signedInfoMatch || !signedInfoMatch[0]) {
      return false;
    }

    const signatureBase64 = sigValueMatch[1].replace(/\s+/g, "");
    const signedInfoXml = signedInfoMatch[0];

    // Format certificate as standard PEM if raw base64 string was provided
    let formattedCert = certPem.trim();
    if (!formattedCert.includes("BEGIN CERTIFICATE")) {
      formattedCert = `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----`;
    }

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(signedInfoXml);
    return verifier.verify(formattedCert, signatureBase64, "base64");
  } catch {
    return false;
  }
}

/**
 * Decodes, validates cryptographic constraints, and parses SAMLResponse assertion.
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

  // 1. Validate Time-Window Conditions (NotBefore / NotOnOrAfter)
  const notBeforeMatch = xml.match(/NotBefore="([^"]+)"/i);
  const notOnOrAfterMatch = xml.match(/NotOnOrAfter="([^"]+)"/i);
  const now = Date.now();
  const clockSkewMs = 5 * 60 * 1000; // 5 minute clock skew allowance

  if (notBeforeMatch && notBeforeMatch[1]) {
    const notBeforeTime = new Date(notBeforeMatch[1]).getTime();
    if (!isNaN(notBeforeTime) && now + clockSkewMs < notBeforeTime) {
      throw new Error("SAML assertion is not yet valid (NotBefore check failed)");
    }
  }

  if (notOnOrAfterMatch && notOnOrAfterMatch[1]) {
    const notOnOrAfterTime = new Date(notOnOrAfterMatch[1]).getTime();
    if (!isNaN(notOnOrAfterTime) && now - clockSkewMs >= notOnOrAfterTime) {
      throw new Error("SAML assertion has expired (NotOnOrAfter check failed)");
    }
  }

  // 2. Validate Audience Restriction if configured
  const expectedAudience = config?.expectedAudience || process.env.SAML_AUDIENCE;
  if (expectedAudience) {
    const audienceMatch = xml.match(/<(?:saml2?:)?Audience[^>]*>([^<]+)<\/(?:saml2?:)?Audience>/i);
    if (!audienceMatch || !audienceMatch[1] || audienceMatch[1].trim() !== expectedAudience.trim()) {
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
    const hasSignature = /<(?:ds:)?SignatureValue[^>]*>/i.test(xml);
    if (!hasSignature) {
      throw new Error("Security Violation: Production SAML assertions must be cryptographically signed with configured SAML_IDP_CERT");
    }
  }

  // 4. Extract NameID / Email / Attributes
  const nameIdMatch = xml.match(/<saml(?:2)?:NameID[^>]*>([^<]+)<\/saml(?:2)?:NameID>/i);
  const emailMatch = xml.match(/<saml(?:2)?:Attribute Name="(?:email|emailAddress|http:\/\/schemas\.xmlsoap\.org\/ws\/2005\/05\/identity\/claims\/emailaddress)"[^>]*>\s*<saml(?:2)?:AttributeValue[^>]*>([^<]+)<\/saml(?:2)?:AttributeValue>/i);
  const nameMatch = xml.match(/<saml(?:2)?:Attribute Name="(?:name|displayName|http:\/\/schemas\.xmlsoap\.org\/ws\/2005\/05\/identity\/claims\/name)"[^>]*>\s*<saml(?:2)?:AttributeValue[^>]*>([^<]+)<\/saml(?:2)?:AttributeValue>/i);

  const emailRaw = emailMatch?.[1] || nameIdMatch?.[1] || "";
  let email = emailRaw.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    if (xml.includes("@")) {
      const fallbackEmail = xml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
      if (fallbackEmail) {
        email = fallbackEmail.toLowerCase();
        return {
          nameId: email,
          email,
          displayName: email.split("@")[0] || "saml_user"
        };
      }
    }
    throw new Error("SAML assertion contains no valid Email or NameID attribute");
  }

  const displayName = nameMatch?.[1]?.trim() || email.split("@")[0] || "saml_user";
  const nameId = nameIdMatch?.[1]?.trim() || email;

  return {
    nameId,
    email,
    displayName
  };
}
