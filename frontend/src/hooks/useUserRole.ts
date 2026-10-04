"use client";

import { useAccount, useReadContract } from "wagmi";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../contracts/chainWarranty";

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function useUserRole() {
  const { address, isConnected } = useAccount();

  const { data: manufacturerRole } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "MANUFACTURER_ROLE",
  });

  const { data: isAdmin } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: isManufacturer } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "hasRole",
    args: [
      manufacturerRole as `0x${string}`,
      address!,
    ],
    query: {
      enabled:
        isConnected &&
        !!address &&
        !!manufacturerRole,
    },
  });

  return {
    isAdmin: Boolean(isAdmin),
    isManufacturer: Boolean(isManufacturer),
    isCustomer:
      isConnected &&
      !isAdmin &&
      !isManufacturer,
  };
}