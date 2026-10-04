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

import VerifiedUser from "@mui/icons-material/VerifiedUser";
import QrCode from "@mui/icons-material/QrCode";
import EventAvailable from "@mui/icons-material/EventAvailable";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

export default function IssueWarranty() {
  const [productId, setProductId] = useState("");
  const [warrantyEnd, setWarrantyEnd] = useState("");

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

  // Reset form & mở toast thành công
  useEffect(() => {
    if (isConfirmed) {
      setProductId("");
      setWarrantyEnd("");
      setFormError("");
      resetWriteContract();

      setSuccessToastOpen(true);
    }
  }, [isConfirmed, resetWriteContract]);

  // Bật toast thất bại khi gặp lỗi giao dịch
  useEffect(() => {
    if (writeError) {
      setErrorToastOpen(true);
    }
  }, [writeError]);

  // Hàm xóa sạch thông báo lỗi khi người dùng tương tác với input
  const clearErrors = () => {
    if (formError) setFormError("");
    if (writeError) resetWriteContract();
  };

  const handleIssueWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!productId.trim() || !warrantyEnd) {
      setFormError("Vui lòng nhập đầy đủ Mã sản phẩm và Thời hạn bảo hành (*)");
      return;
    }

    const endTimestamp = BigInt(
      Math.floor(new Date(warrantyEnd).getTime() / 1000)
    );

    writeContract({
      address: CHAIN_WARRANTY_ADDRESS,
      abi: CHAIN_WARRANTY_ABI,
      functionName: "issueWarranty",
      args: [productId.trim(), BigInt(0), endTimestamp],
    });
  };

  const isProcessing = isPending || (!!hash && isConfirming);

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <VerifiedUser sx={{ color: "#16A34A", fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#111827" }}>
          Phát hành Bảo hành (Issue Warranty)
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 5 }}>
        Kích hoạt thời hạn bảo hành cho sản phẩm đã đăng ký trên Blockchain.
      </Typography>

      {/* Form Card */}
      <Paper
        component="form"
        onSubmit={handleIssueWarranty}
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
            <Alert severity="error" icon={<Error />} sx={{ borderRadius: 2 }}>
              Giao dịch thất bại. Vui lòng kiểm tra quyền hạn ví hoặc thử lại.
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
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              startAdornment: (
                <InputAdornment position="start">
                  <QrCode fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputLabel-root": {
                transform: "translate(10px, -9px) scale(0.75) !important",
                bgcolor: "#FFFFFF",
                px: 0.5,
              },
            }}
          />

          {/* Datetime Input */}
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Thời gian kết thúc bảo hành *"
            value={warrantyEnd}
            onFocus={clearErrors}
            onChange={(e) => {
              clearErrors();
              setWarrantyEnd(e.target.value);
            }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              startAdornment: (
                <InputAdornment position="start">
                  <EventAvailable fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputLabel-root": {
                transform: "translate(10px, -9px) scale(0.75) !important",
                bgcolor: "#FFFFFF",
                px: 0.5,
              },
            }}
          />

          {/* Nút kích hoạt */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isProcessing}
            sx={{
              py: 1.2,
              borderRadius: 2,
              bgcolor: "#16A34A",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              "&:hover": { bgcolor: "#15803D" },
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
              "Kích hoạt bảo hành"
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Thông báo Thành công Toast */}
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
          Kích hoạt bảo hành thành công cho sản phẩm!
        </Alert>
      </Snackbar>

      {/* Thông báo Thất bại Toast */}
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
          Kích hoạt bảo hành thất bại! Kiểm tra quyền hạn ví hoặc thử lại.
        </Alert>
      </Snackbar>
    </Box>
  );
}