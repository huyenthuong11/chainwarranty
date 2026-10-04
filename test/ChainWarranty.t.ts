import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("ChainWarranty", async function () {
  const { viem } = await hre.network.connect();

  it("should register a product and issue a warranty", async function () {
    const [admin, manufacturer] = await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
      manufacturerRole,
      manufacturer.account.address,
    ]);

    await contract.write.registerProduct(
      ["SP001", "iPhone 17", "A3294", "QmTestCID"],
      {
        account: manufacturer.account,
      },
    );

    const now = BigInt(Math.floor(Date.now() / 1000));
    const warrantyEnd = now + 365n * 24n * 60n * 60n;

    await contract.write.issueWarranty(
      ["SP001", now, warrantyEnd],
      {
        account: manufacturer.account,
      },
    );

    const product = await contract.read.getProduct(["SP001"]);

    assert.equal(product.productId, "SP001");
    assert.equal(product.name, "iPhone 17");
    assert.equal(product.model, "A3294");

    assert.equal(
      product.manufacturer.toLowerCase(),
      manufacturer.account.address.toLowerCase(),
    );

    assert.equal(product.warrantyStart, now);
    assert.equal(product.warrantyEnd, warrantyEnd);
  });

  it("should reject warranty issuance from another manufacturer", async function () {
    const [admin, manufacturerA, manufacturerB] =
      await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
      manufacturerRole,
      manufacturerA.account.address,
    ]);

    await contract.write.grantRole([
      manufacturerRole,
      manufacturerB.account.address,
    ]);

    await contract.write.registerProduct(
      ["SP001", "iPhone 17", "A3294", "QmTestCID"],
      {
        account: manufacturerA.account,
      },
    );

    const now = BigInt(Math.floor(Date.now() / 1000));
    const warrantyEnd = now + 365n * 24n * 60n * 60n;

    await assert.rejects(
      contract.write.issueWarranty(
        ["SP001", now, warrantyEnd],
        {
          account: manufacturerB.account,
        },
      ),
    );
  });

  it("should reject product registration from a non-manufacturer", async function () {
    const [admin, user] = await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    await assert.rejects(
      contract.write.registerProduct(
        ["SP002", "MacBook Air", "M4", "QmTestCID"],
        {
          account: user.account,
        },
      ),
    );
  });

  it("should transfer product ownership and record ownership history", async function () {
    const [admin, manufacturer, newOwner] =
      await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
      manufacturerRole,
      manufacturer.account.address,
    ]);

    await contract.write.registerProduct(
      ["SP001", "iPhone 17", "A3294", "QmTestCID"],
      {
        account: manufacturer.account,
      },
    );

    await contract.write.transferOwnership(
      ["SP001", newOwner.account.address],
      {
        account: manufacturer.account,
      },
    );

    const product = await contract.read.getProduct(["SP001"]);

    assert.equal(
      product.owner.toLowerCase(),
      newOwner.account.address.toLowerCase(),
    );

    const history = await contract.read.getOwnershipHistory(["SP001"]);

    assert.equal(history.length, 2);

    assert.equal(
      history[0].owner.toLowerCase(),
      manufacturer.account.address.toLowerCase(),
    );

    assert.equal(
      history[1].owner.toLowerCase(),
      newOwner.account.address.toLowerCase(),
    );
  });

  it("should reject ownership transfer from a non-owner", async function () {
    const [admin, manufacturer, owner, attacker] =
      await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
      manufacturerRole,
      manufacturer.account.address,
    ]);

    await contract.write.registerProduct(
      ["SP001", "iPhone 17", "A3294", "QmTestCID"],
      {
        account: manufacturer.account,
      },
    );

    await contract.write.transferOwnership(
      ["SP001", owner.account.address],
      {
        account: manufacturer.account,
      },
    );

    await assert.rejects(
      contract.write.transferOwnership(
        ["SP001", attacker.account.address],
        {
          account: attacker.account,
        },
      ),
    );
  });

  it("should verify a valid warranty", async function () {
    const [admin, manufacturer] = await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
      manufacturerRole,
      manufacturer.account.address,
    ]);

    await contract.write.registerProduct(
      ["SP001", "iPhone 17", "A3294", "QmTestCID"],
      {
        account: manufacturer.account,
      },
    );

    const warrantyEnd =
      BigInt(Math.floor(Date.now() / 1000)) +
      365n * 24n * 60n * 60n;

    await contract.write.issueWarranty(
      ["SP001", 0n, warrantyEnd],
      {
        account: manufacturer.account,
      },
    );

    const result = await contract.read.verifyWarranty(["SP001"]);

    assert.equal(result[0], true);
    assert.ok(result[1] > 0n);
    assert.equal(result[2], warrantyEnd);
  });

  it("should reject invalid ownership transfer", async function () {
    const [admin, manufacturer] = await viem.getWalletClients();

    const contract = await viem.deployContract("ChainWarranty", []);

    const manufacturerRole = await contract.read.MANUFACTURER_ROLE();

    await contract.write.grantRole([
        manufacturerRole,
        manufacturer.account.address,
    ]);

    await contract.write.registerProduct(
        ["SP001", "iPhone 17", "A3294", "QmTestCID"],
        {
        account: manufacturer.account,
        },
    );

    // Cannot transfer to zero address
    await assert.rejects(
        contract.write.transferOwnership(
        ["SP001", "0x0000000000000000000000000000000000000000"],
        {
            account: manufacturer.account,
        },
        ),
    );

    // Cannot transfer to the current owner
    await assert.rejects(
        contract.write.transferOwnership(
        ["SP001", manufacturer.account.address],
        {
            account: manufacturer.account,
        },
        ),
    );
    });
});