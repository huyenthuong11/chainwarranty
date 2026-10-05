
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
} from "@mui/material";

import {
  Verified,
  Search,
  AppRegistration,
  AssignmentTurnedIn,
  SwapHoriz,
  AdminPanelSettings,
} from "@mui/icons-material";

import ConnectWallet from "../components/wallet/ConnectWallet";
import ProductLookup from "../components/product/ProductLookup";
import AddManufacturer from "../components/admin/AddManufacturer";
import RegisterProduct from "../components/product/RegisterProduct";
import IssueWarranty from "../components/warranty/IssueWarranty";
import TransferOwnership from "../components/product/TransferOwnership";
import { useUserRole } from "../hooks/useUserRole";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function CustomTabPanel({
  children,
  value,
  index,
}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`warranty-tabpanel-${index}`}
      aria-labelledby={`warranty-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin, isManufacturer, isCustomer } = useUserRole();

  const tabs = [
    {
      key: "lookup",
      label: "Tra cứu và Xác thực",
      icon: <Search sx={{ fontSize: 18 }} />,
      roles: ["admin", "manufacturer", "customer"],
    },
    {
      key: "register",
      label: "Đăng ký sản phẩm",
      icon: <AppRegistration sx={{ fontSize: 18 }} />,
      roles: ["manufacturer"],
    },
    {
      key: "warranty",
      label: "Phát hành bảo hành",
      icon: <AssignmentTurnedIn sx={{ fontSize: 18 }} />,
      roles: ["manufacturer"],
    },
    {
      key: "transfer",
      label: "Chuyển quyền sở hữu",
      icon: <SwapHoriz sx={{ fontSize: 18 }} />,
      roles: ["manufacturer", "customer"],
    },
    {
      key: "admin",
      label: "Ủy quyền Nhà sản xuất",
      icon: <AdminPanelSettings sx={{ fontSize: 18 }} />,
      roles: ["admin"],
    },
  ].filter((tab) => {
    if (tab.roles.includes("admin") && isAdmin) {
      return true;
    }

    if (tab.roles.includes("manufacturer") && isManufacturer) {
      return true;
    }

    if (tab.roles.includes("customer") && isCustomer) {
      return true;
    }

    return false;
  });

  // Khi đổi account / role, quay về tab đầu tiên
  useEffect(() => {
    setTabValue(0);
  }, [isAdmin, isManufacturer, isCustomer]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabValue(newValue);
  };

  const activeTab = tabs[tabValue]?.key;

  return (
    <Box
      sx={{
        bgcolor: "#F4F6F9",
        minHeight: "100vh",
        pb: 8,
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: "1px solid #E5E7EB",
          borderRadius: 0,
          bgcolor: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 1.5 }}
          >
            {/* Logo */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ flexGrow: 1, mr: 2 }}
            >
              <Box
                sx={{
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Verified sx={{ fontSize: 26 }} />
              </Box>

              <Typography
                variant="h6"
                fontWeight="bold"
                color="#111827"
              >
                ChainWarranty
              </Typography>
            </Stack>

            {/* Connect Wallet */}
            <ConnectWallet />
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            p: 0.8,
            bgcolor: "#FFFFFF",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: 2,
                minHeight: 44,
                px: 2,
                color: "#6B7280",

                "&.Mui-selected": {
                  color: "#4F46E5",
                  bgcolor: "#EEF2FF",
                },
              },

              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Paper>

        {/* TAB 0 — Product Lookup */}
        {activeTab === "lookup" && (
          <CustomTabPanel value={tabValue} index={tabValue}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <ProductLookup />
            </Paper>
          </CustomTabPanel>
        )}

        {/* TAB — Register Product */}
        {activeTab === "register" && (
          <CustomTabPanel value={tabValue} index={tabValue}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <RegisterProduct />
            </Paper>
          </CustomTabPanel>
        )}

        {/* TAB — Issue Warranty */}
        {activeTab === "warranty" && (
          <CustomTabPanel value={tabValue} index={tabValue}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <IssueWarranty />
            </Paper>
          </CustomTabPanel>
        )}

        {/* TAB — Transfer Ownership */}
        {activeTab === "transfer" && (
          <CustomTabPanel value={tabValue} index={tabValue}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <TransferOwnership />
            </Paper>
          </CustomTabPanel>
        )}

        {/* TAB — Admin */}
        {activeTab === "admin" && (
          <CustomTabPanel value={tabValue} index={tabValue}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <AddManufacturer />
            </Paper>
          </CustomTabPanel>
        )}
      </Container>
    </Box>
  );
}
