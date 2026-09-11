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

/**
 * Decodes and validates base64 SAMLResponse assertion payload.
 */
export function parseSAMLAssertion(samlResponseBase64: string): SAMLUserIdentity {
  if (!samlResponseBase64 || typeof samlResponseBase64 !== "string") {
    throw new Error("SAMLResponse assertion body is required");
  }

  let xml = "";
  try {
    xml = Buffer.from(samlResponseBase64, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid base64 encoding for SAMLResponse");
  }

  // Extract NameID / Email / Attributes using Regex parser
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
