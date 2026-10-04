import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChainWarrantyModule = buildModule("ChainWarrantyModule", (m) => {
  const chainWarranty = m.contract("ChainWarranty");

  return { chainWarranty };
});

export default ChainWarrantyModule;