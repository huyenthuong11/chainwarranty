"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";

import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Logout from "@mui/icons-material/Logout";
import Check from "@mui/icons-material/Check";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Hàm rút gọn địa chỉ ví: 0x1234...5678
  const formatAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Sao chép địa chỉ ví
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="outlined"
        disabled
        size="small"
        sx={{ borderRadius: 2, px: 2, py: 0.8, textTransform: "none" }}
      >
        Đang tải ví...
      </Button>
    );
  }

  // TRẠNG THÁI 1: ĐÃ KẾT NỐI VÍ
  if (isConnected && address) {
    return (
      <Box>
        <Paper
          elevation={0}
          onClick={handleOpenMenu}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            px: 1.5,
            py: 0.8,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            cursor: "pointer",
            bgcolor: "#FFFFFF",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#CBD5E1",
              bgcolor: "#F8FAFC",
            },
          }}
        >
          {/* Avatar nhận diện ví */}
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: "#4F46E5",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {address.substring(2, 4).toUpperCase()}
          </Avatar>

          {/* Địa chỉ rút gọn */}
          <Stack direction="column" spacing={-0.2}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Typography variant="body2" fontWeight={600} sx={{ color: "#1E293B" }}>
                {formatAddress(address)}
              </Typography>
              <Chip
                label="Đã kết nối"
                size="small"
                color="success"
                sx={{ height: 16, fontSize: "10px", fontWeight: 600, px: 0.5 }}
              />
            </Stack>
          </Stack>

          <KeyboardArrowDown fontSize="small" sx={{ color: "#64748B" }} />
        </Paper>

        {/* Dropdown Menu điều khiển ví */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2.5,
              border: "1px solid #E5E7EB",
              boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.05)",
              p: 0.5,
            },
          }}
        >
          <MenuItem
            onClick={handleCopyAddress}
            sx={{ borderRadius: 1.5, py: 1, fontSize: "14px" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
              {copied ? (
                <Check fontSize="small" color="success" />
              ) : (
                <ContentCopy fontSize="small" sx={{ color: "#64748B" }} />
              )}
              <Typography variant="body2" color={copied ? "success.main" : "text.primary"}>
                {copied ? "Đã chép địa chỉ" : "Sao chép địa chỉ ví"}
              </Typography>
            </Stack>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseMenu();
              disconnect();
            }}
            sx={{ borderRadius: 1.5, py: 1, color: "#EF4444", fontSize: "14px" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Logout fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Ngắt kết nối
              </Typography>
            </Stack>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // TRẠNG THÁI 2: CHƯA KẾT NỐI VÍ
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="contained"
          disableElevation
          onClick={() => connect({ connector })}
          disabled={isPending}
          startIcon={
            isPending ? (
              <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
            ) : (
              <AccountBalanceWallet fontSize="small" />
            )
          }
          sx={{
            borderRadius: 2,
            py: 0.9,
            px: 2,
            bgcolor: "#4F46E5",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            "&:hover": { bgcolor: "#4338CA" },
          }}
        >
          {isPending ? "Đang kết nối..." : `Kết nối ${connector.name}`}
        </Button>
      ))}
    </Stack>
  );
}