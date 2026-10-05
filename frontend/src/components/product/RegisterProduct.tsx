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

import AppRegistration from "@mui/icons-material/AppRegistration";
import Inventory from "@mui/icons-material/Inventory";
import Category from "@mui/icons-material/Category";
import ImageIcon from "@mui/icons-material/Image";
import QrCode from "@mui/icons-material/QrCode";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

export default function RegisterProduct() {
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [imageCID, setImageCID] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  // Xử lý khi đăng ký thành công trên Blockchain
  useEffect(() => {
    if (isConfirmed) {
      setProductId("");
      setName("");
      setModel("");
      setImageCID("");
      setFormError("");
      resetWriteContract();

      setSuccessToastOpen(true);
    }
  }, [isConfirmed, resetWriteContract]);

  // Xử lý bật Toast khi gặp lỗi giao dịch
  useEffect(() => {
    if (writeError) {
      setErrorToastOpen(true);
    }
  }, [writeError]);

  // Hàm xóa sạch thông báo lỗi khi người dùng tương tác/nhập dữ liệu vào ô text
  const clearErrors = () => {
    if (formError) setFormError("");
    if (writeError) resetWriteContract();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!productId.trim() || !name.trim() || !model.trim()) {
        setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
        return;
    }

    let cid = imageCID;

    try {
        if (imageFile) {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload ảnh thất bại");
        }

        cid = data.cid;

        console.log("Pinata response:", data);
        console.log("Uploaded CID:", cid);

        setImageCID(cid);
        }

        writeContract({
        address: CHAIN_WARRANTY_ADDRESS,
        abi: CHAIN_WARRANTY_ABI,
        functionName: "registerProduct",
        args: [productId.trim(), name.trim(), model.trim(), cid.trim()],
        });
    } catch (error) {
        console.error("Image upload error:", error);
        setFormError("Không thể upload ảnh lên IPFS. Vui lòng thử lại.");
    } finally {
        setIsUploading(false);
    }
    };

  const isProcessing = isPending || (!!hash && isConfirming);

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <AppRegistration sx={{ color: "#4F46E5", fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#111827" }}>
          Đăng ký sản phẩm mới (Register Product)
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 5 }}>
        Khởi tạo và ghi nhận dữ liệu sản phẩm mới lên Smart Contract Blockchain.
      </Typography>

      {/* Form Card */}
      <Paper
        component="form"
        onSubmit={handleRegister}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack spacing={2.5}>
          {/* Lỗi Client-side Validation */}
          {formError && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          {/* Lỗi Giao dịch Thất bại */}
          {writeError && (
            <Alert severity="error" icon={<Error />} sx={{ borderRadius: 2 }}>
              Giao dịch thất bại. Vui lòng kiểm tra lại ví kết nối hoặc thử lại.
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

          {/* Product Name */}
          <TextField
            fullWidth
            size="small"
            label="Tên sản phẩm (Product Name) *"
            placeholder="Ví dụ: Tai nghe Bluetooth Wireless X"
            value={name}
            onFocus={clearErrors}
            onChange={(e) => {
              clearErrors();
              setName(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Inventory fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Product Model */}
          <TextField
            fullWidth
            size="small"
            label="Model / Dòng sản phẩm *"
            placeholder="Ví dụ: PRO-2026-V1"
            value={model}
            onFocus={clearErrors}
            onChange={(e) => {
              clearErrors();
              setModel(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category fontSize="small" sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Product Image */}
        <Box>
        <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
            fullWidth
            sx={{
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            }}
            disabled={isUploading || isProcessing}
        >
            {isUploading ? "Đang upload ảnh lên IPFS..." : "Chọn ảnh sản phẩm"}
            <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
                clearErrors();

                const file = e.target.files?.[0];

                if (file) {
                setImageFile(file);
                setImageCID("");
                }
            }}
            />
        </Button>

        {imageFile && (
            <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
            >
            Đã chọn: {imageFile.name}
            </Typography>
        )}

        {imageCID && (
            <Typography
            variant="caption"
            color="success.main"
            sx={{ display: "block", mt: 0.5 }}
            >
            Ảnh đã upload IPFS: {imageCID}
            </Typography>
        )}

        <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
        >
            Không bắt buộc. Ảnh sẽ được lưu trên IPFS.
        </Typography>
        </Box>

          {/* Nút đăng ký */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isProcessing || isUploading}
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
            {isUploading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                    <span>Đang upload ảnh lên IPFS...</span>
                </Stack>
                ) : isPending ? (
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
                "Đăng ký sản phẩm"
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Toast Thông báo Thành công */}
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
          Đã đăng ký sản phẩm mới thành công lên Blockchain!
        </Alert>
      </Snackbar>

      {/* Toast Thông báo Thất bại */}
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
          Thao tác thất bại! Kiểm tra lại quyền ví hoặc hủy giao dịch.
        </Alert>
      </Snackbar>
    </Box>
  );
}