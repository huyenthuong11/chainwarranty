"use client";

import React, { useState, useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
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

import SwapHoriz from "@mui/icons-material/SwapHoriz";
import QrCode from "@mui/icons-material/QrCode";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

export default function TransferOwnership() {
  const [productId, setProductId] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const [formError, setFormError] = useState("");
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [errorToastOpen, setErrorToastOpen] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWriteContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Tự động clear form và bật thông báo thành công
  useEffect(() => {
    if (isConfirmed) {
      setProductId("");
      setNewOwner("");
      setFormError("");
      resetWriteContract();

      setSuccessToastOpen(true);
    }
  }, [isConfirmed, resetWriteContract]);

  // Bật toast thông báo lỗi khi giao dịch thất bại
  useEffect(() => {
    if (writeError) {
      setErrorToastOpen(true);
    }
  }, [writeError]);

  // Hàm xóa sạch các thông báo lỗi khi người dùng nhấn/gõ vào ô text
  const clearErrors = () => {
    if (formError) setFormError("");
    if (writeError) resetWriteContract();
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!productId.trim() || !newOwner.trim()) {
      setFormError("Vui lòng nhập đầy đủ Mã sản phẩm và Địa chỉ ví người nhận (*)");
      return;
    }

    // Kiểm tra định dạng địa chỉ ví Ethereum (0x...)
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner.trim())) {
      setFormError("Địa chỉ ví người nhận không hợp lệ (Phải đúng định dạng 0x...)");
      return;
    }

    writeContract({
      address: CHAIN_WARRANTY_ADDRESS,
      abi: CHAIN_WARRANTY_ABI,
      functionName: "transferOwnership",
      args: [productId.trim(), newOwner.trim() as `0x${string}`],
    });
  };

  const isProcessing = isPending || (!!hash && isConfirming);

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <SwapHoriz sx={{ color: "#6366F1", fontSize: 30 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#111827" }}>
          Chuyển quyền sở hữu (Transfer Ownership)
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 5 }}>
        Thay đổi địa chỉ ví đại diện cho chủ sở hữu hiện tại của sản phẩm.
      </Typography>

      {/* Form Card */}
      <Paper
        component="form"
        onSubmit={handleTransfer}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack spacing={2.5}>
          {/* Lỗi Client Validation */}
          {formError && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* Lỗi Giao dịch On-chain */}
          {writeError && (
            <Alert
              severity="error"
              icon={<Error />}
              sx={{ borderRadius: 2 }}
            >
              Chuyển nhượng thất bại. Kiểm tra lại quyền sở hữu hoặc địa chỉ ví.
            </Alert>
          )}

          {/* Product ID */}
          <TextField
            fullWidth
            size="small"
            label="Mã sản phẩm (Product ID) *"
            placeholder="Ví dụ: SP-2026-8892"
            value={productId}
            onFocus={clearErrors}
            onChange={(e) => {
              clearErrors();
              setProductId(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <QrCode fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* New Owner Address */}
          <TextField
            fullWidth
            size="small"
            label="Địa chỉ ví chủ sở hữu mới *"
            placeholder="0x..."
            value={newOwner}
            onFocus={clearErrors}
            onChange={(e) => {
              clearErrors();
              setNewOwner(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceWallet fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Button Chuyển nhượng */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isProcessing}
            sx={{
              py: 1.2,
              borderRadius: 2,
              bgcolor: "#6366F1",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              "&:hover": { bgcolor: "#4F46E5" },
            }}
          >
            {isPending ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                <span>Đang chờ xác nhận từ MetaMask...</span>
              </Stack>
            ) : hash && isConfirming ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                <span>Đang chờ giao dịch được xác nhận...</span>
              </Stack>
            ) : (
              "Chuyển quyền sở hữu"
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Snackbar Thông báo Thành công */}
      <Snackbar
        open={successToastOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessToastOpen(false)}
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          Đã chuyển quyền sở hữu sản phẩm thành công!
        </Alert>
      </Snackbar>

      {/* Snackbar Thông báo Thất bại */}
      <Snackbar
        open={errorToastOpen}
        autoHideDuration={4000}
        onClose={() => setErrorToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorToastOpen(false)}
          severity="error"
          icon={<Error fontSize="inherit" />}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          Chuyển nhượng thất bại! Kiểm tra lại quyền ví hoặc thử lại.
        </Alert>
      </Snackbar>
    </Box>
  );
}