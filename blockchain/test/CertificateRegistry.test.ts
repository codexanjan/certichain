import { expect } from "chai";
import { ethers } from "hardhat";
import { CertificateRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CertificateRegistry Smart Contract", function () {
  let registry: CertificateRegistry;
  let owner: SignerWithAddress;
  let issuer: SignerWithAddress;
  let otherUser: SignerWithAddress;

  // Test certificate fixtures
  const certId = "CERT-2026-TEST01";
  const certKey = ethers.keccak256(ethers.toUtf8Bytes(certId));
  const rawHashHex = "0x8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e";
  const tamperedHashHex = "0x1111111122222222333333334444444455555555666666667777777788888888";

  beforeEach(async function () {
    [owner, issuer, otherUser] = await ethers.getSigners();
    const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment & Initial State", function () {
    it("should set deployer as contract owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("should automatically authorize contract owner as issuer", async function () {
      expect(await registry.isIssuerAuthorized(owner.address)).to.be.true;
    });

    it("should report uninitialized certificates as non-existent", async function () {
      expect(await registry.certificateExists(certKey)).to.be.false;
    });
  });

  describe("Issuer Authorization Management", function () {
    it("should allow owner to authorize a new institution", async function () {
      await expect(registry.connect(owner).authorizeIssuer(issuer.address))
        .to.emit(registry, "IssuerAuthorized")
        .withArgs(issuer.address);

      expect(await registry.isIssuerAuthorized(issuer.address)).to.be.true;
    });

    it("should allow owner to deauthorize an institution", async function () {
      await registry.connect(owner).authorizeIssuer(issuer.address);
      await expect(registry.connect(owner).deauthorizeIssuer(issuer.address))
        .to.emit(registry, "IssuerDeauthorized")
        .withArgs(issuer.address);

      expect(await registry.isIssuerAuthorized(issuer.address)).to.be.false;
    });

    it("should reject non-owner attempting to authorize issuers", async function () {
      await expect(
        registry.connect(otherUser).authorizeIssuer(otherUser.address)
      ).to.be.revertedWithCustomError(registry, "OnlyOwner");
    });
  });

  describe("Certificate Registration", function () {
    beforeEach(async function () {
      await registry.connect(owner).authorizeIssuer(issuer.address);
    });

    it("should allow an authorized issuer to register a certificate", async function () {
      const tx = await registry.connect(issuer).registerCertificate(certKey, rawHashHex);
      await expect(tx)
        .to.emit(registry, "CertificateRegistered")
        .withArgs(certKey, rawHashHex, issuer.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      expect(await registry.certificateExists(certKey)).to.be.true;

      const record = await registry.getCertificate(certKey);
      expect(record.documentHash).to.equal(rawHashHex);
      expect(record.issuer).to.equal(issuer.address);
      expect(record.status).to.equal(1); // CertificateStatus.Active
      expect(record.revokedAt).to.equal(0);
    });

    it("should reject certificate registration from an unauthorized sender", async function () {
      await expect(
        registry.connect(otherUser).registerCertificate(certKey, rawHashHex)
      ).to.be.revertedWithCustomError(registry, "OnlyAuthorizedIssuer");
    });

    it("should reject duplicate certificate registration for the same key", async function () {
      await registry.connect(issuer).registerCertificate(certKey, rawHashHex);
      await expect(
        registry.connect(issuer).registerCertificate(certKey, rawHashHex)
      ).to.be.revertedWithCustomError(registry, "CertificateAlreadyRegistered");
    });

    it("should reject invalid zero key or zero hash", async function () {
      await expect(
        registry.connect(issuer).registerCertificate(ethers.ZeroHash, rawHashHex)
      ).to.be.revertedWithCustomError(registry, "InvalidKey");

      await expect(
        registry.connect(issuer).registerCertificate(certKey, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(registry, "InvalidHash");
    });
  });

  describe("Verification Helper Function", function () {
    beforeEach(async function () {
      await registry.connect(owner).authorizeIssuer(issuer.address);
      await registry.connect(issuer).registerCertificate(certKey, rawHashHex);
    });

    it("should return isValid = true for matching candidate hash", async function () {
      const [isValid, isTampered, isRevoked] = await registry.verifyCertificate(certKey, rawHashHex);
      expect(isValid).to.be.true;
      expect(isTampered).to.be.false;
      expect(isRevoked).to.be.false;
    });

    it("should return isTampered = true for altered candidate hash", async function () {
      const [isValid, isTampered, isRevoked] = await registry.verifyCertificate(certKey, tamperedHashHex);
      expect(isValid).to.be.false;
      expect(isTampered).to.be.true;
      expect(isRevoked).to.be.false;
    });

    it("should return all false for an unregistered certificate key", async function () {
      const unknownKey = ethers.keccak256(ethers.toUtf8Bytes("CERT-UNKNOWN-999"));
      const [isValid, isTampered, isRevoked] = await registry.verifyCertificate(unknownKey, rawHashHex);
      expect(isValid).to.be.false;
      expect(isTampered).to.be.false;
      expect(isRevoked).to.be.false;
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await registry.connect(owner).authorizeIssuer(issuer.address);
      await registry.connect(issuer).registerCertificate(certKey, rawHashHex);
    });

    it("should allow the original issuer to revoke their certificate", async function () {
      const reason = "Administrative academic cancellation";
      const tx = await registry.connect(issuer).revokeCertificate(certKey, reason);

      await expect(tx)
        .to.emit(registry, "CertificateRevoked")
        .withArgs(certKey, issuer.address, (await ethers.provider.getBlock("latest"))?.timestamp, reason);

      const record = await registry.getCertificate(certKey);
      expect(record.status).to.equal(2); // CertificateStatus.Revoked
      expect(record.revokedAt).to.be.greaterThan(0);

      const [isValid, isTampered, isRevoked] = await registry.verifyCertificate(certKey, rawHashHex);
      expect(isValid).to.be.false;
      expect(isTampered).to.be.false;
      expect(isRevoked).to.be.true;
    });

    it("should allow the contract owner to revoke a certificate", async function () {
      await expect(registry.connect(owner).revokeCertificate(certKey, "Owner administrative action"))
        .to.emit(registry, "CertificateRevoked");
    });

    it("should reject revocation from unauthorized third-party address", async function () {
      await expect(
        registry.connect(otherUser).revokeCertificate(certKey, "Malicious attempt")
      ).to.be.revertedWithCustomError(registry, "OnlyIssuerOrOwner");
    });

    it("should reject double revocation of an already revoked certificate", async function () {
      await registry.connect(issuer).revokeCertificate(certKey, "First revocation");
      await expect(
        registry.connect(issuer).revokeCertificate(certKey, "Second revocation")
      ).to.be.revertedWithCustomError(registry, "CertificateNotActive");
    });
  });
});
