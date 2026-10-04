"use client";

import React, { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from "@mui/material";

import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

export default function AddManufacturer() {
  const [manufacturer, setManufacturer] = useState("");

  const [formError, setFormError] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // Reset input & kích hoạt toast khi giao dịch thành công
  useEffect(() => {
    if (isSuccess) {
      setManufacturer("");
      setFormError("");
      setToastOpen(true);
    }
  }, [isSuccess]);

  const handleAddManufacturer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!manufacturer.trim()) {
      setFormError("Vui lòng nhập địa chỉ ví của nhà sản xuất (*)");
      return;
    }

    // Validate định dạng địa chỉ ví Ethereum (0x...)
    if (!/^0x[a-fA-F0-9]{40}$/.test(manufacturer.trim())) {
      setFormError("Địa chỉ ví không hợp lệ (Phải đúng định dạng 0x...)");
      return;
    }

    writeContract({
      address: CHAIN_WARRANTY_ADDRESS,
      abi: CHAIN_WARRANTY_ABI,
      functionName: "addManufacturer",
      args: [manufacturer.trim() as `0x${string}`],
    });
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <AdminPanelSettings sx={{ color: "#4F46E5", fontSize: 32 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#111827" }}>
          Thêm Nhà Sản Xuất (Add Manufacturer)
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 5.5 }}>
        Cấp quyền cho địa chỉ ví mới để đăng ký sản phẩm lên hệ thống Blockchain.
      </Typography>

      {/* Form Card */}
      <Paper
        component="form"
        onSubmit={handleAddManufacturer}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack spacing={2.5}>
          {/* Validation Error Alert */}
          {formError && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* On-chain Transaction Error Alert */}
          {error && (
            <Alert
              severity="error"
              icon={<Error />}
              sx={{ borderRadius: 2 }}
            >
              Thao tác thất bại. Vui lòng kiểm tra quyền Admin của ví hiện tại.
            </Alert>
          )}

          {/* Input Wallet Address */}
          <TextField
            fullWidth
            size="small"
            label="Địa chỉ ví nhà sản xuất *"
            placeholder="0x..."
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceWallet fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isPending}
            sx={{
              py: 1.2,
              borderRadius: 2,
              bgcolor: "#4F46E5",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            {isPending ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                <span>Đang cấp quyền...</span>
              </Stack>
            ) : (
              "Thêm Nhà Sản Xuất"
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          Đã cấp quyền Nhà Sản Xuất thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
}