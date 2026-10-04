"use client";

import React, { useState } from "react";
import { useReadContract } from "wagmi";
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Typography,
  Stack,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";

// Import direct icon chuẩn từ MUI
import Search from "@mui/icons-material/Search";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import ErrorIcon from "@mui/icons-material/Error";
import QrCodeScanner from "@mui/icons-material/QrCodeScanner";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import HighlightOff from "@mui/icons-material/HighlightOff";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

// Helper format unix timestamp ra dd/mm/yyyy hh:mm
const formatDate = (timestamp: bigint | number) => {
  if (!timestamp || Number(timestamp) === 0) return "Chưa kích hoạt";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("vi-VN");
};

export default function VerifyWarranty() {
  const [searchInput, setSearchInput] = useState("");
  const [activeProductId, setActiveProductId] = useState("");

  // Gọi hàm verifyWarranty(productId)
  const { data, isLoading, isError } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "verifyWarranty",
    args: [activeProductId],
    query: {
      enabled: activeProductId.length > 0,
    },
  });

  // data trả về là mảng tuple [isValid, startTimestamp, endTimestamp]
  const warrantyData = data as [boolean, bigint, bigint] | undefined;
  const isValid = warrantyData ? warrantyData[0] : false;
  const startDate = warrantyData ? warrantyData[1] : BigInt(0);
  const endDate = warrantyData ? warrantyData[2] : BigInt(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveProductId(searchInput.trim());
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, color: "#111827" }}>
        Xác minh trạng thái bảo hành
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Kiểm tra nhanh tính hiệu lực của bảo hành trực tiếp từ Smart Contract.
      </Typography>

      {/* Form tìm kiếm */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={0}
        sx={{
          p: "4px 8px",
          display: "flex",
          alignItems: "center",
          border: "1px solid #D1D5DB",
          borderRadius: 2.5,
          bgcolor: "#FFFFFF",
          "&:focus-within": { borderColor: "#4F46E5", boxShadow: "0 0 0 3px #EEF2FF" },
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: "15px" }}
          placeholder="Nhập mã sản phẩm (Ví dụ: SP-2026-8892)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Tooltip title="Quét mã QR">
          <IconButton sx={{ p: "10px", color: "#6B7280" }}>
            <QrCodeScanner />
          </IconButton>
        </Tooltip>
        <IconButton type="submit" sx={{ p: "10px", color: "#4F46E5" }}>
          <Search />
        </IconButton>
      </Paper>

      {/* Trạng thái Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress size={24} sx={{ color: "#4F46E5" }} />
          <Typography variant="body2" color="text.secondary">
            Đang xác minh bảo hành...
          </Typography>
        </Box>
      )}

      {/* Trạng thái Lỗi */}
      {isError && !isLoading && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 3, borderRadius: 2 }}>
          Không thể truy vấn thông tin. Mã sản phẩm không tồn tại hoặc có lỗi kết nối mạng.
        </Alert>
      )}

      {/* Kết quả xác minh */}
      {warrantyData && !isLoading && !isError && (
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          {/* Banner Trạng thái - Đẩy Chip sang sát góc phải */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: isValid ? "#F0FDF4" : "#FEF2F2",
              border: "1px solid",
              borderColor: isValid ? "#86EFAC" : "#FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, mr: 2 }}>
              {isValid ? (
                <VerifiedUser sx={{ color: "#16A34A", fontSize: 28 }} />
              ) : (
                <HighlightOff sx={{ color: "#EF4444", fontSize: 28 }} />
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color={isValid ? "#166534" : "#991B1B"}>
                  {isValid
                    ? "Bảo hành HỢP LỆ (Valid)"
                    : "Bảo hành HẾT HẠN / CHƯA KÍCH HOẠT"}
                </Typography>
                <Typography variant="caption" color={isValid ? "#15803D" : "#B91C1C"}>
                  Mã sản phẩm: <strong>{activeProductId}</strong>
                </Typography>
              </Box>
            </Stack>

            {/* Chip trạng thái đẩy sang sát góc phải */}
            <Chip
              label={isValid ? "VALID" : "EXPIRED"}
              color={isValid ? "success" : "error"}
              size="small"
              sx={{ fontWeight: "bold", flexShrink: 0 }}
            />
          </Paper>

          {/* Chi tiết thời gian */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: "1px solid #E5E7EB",
              bgcolor: "#FAFADA",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <CalendarMonth sx={{ fontSize: 18, color: "#6B7280" }} />
                  <Typography variant="caption" color="text.secondary">
                    Thời gian bắt đầu (Start)
                  </Typography>
                </Stack>
                <Typography variant="body1" fontWeight={600} color="#111827" sx={{ ml: 3 }}>
                  {formatDate(startDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <CalendarMonth sx={{ fontSize: 18, color: "#6B7280" }} />
                  <Typography variant="caption" color="text.secondary">
                    Thời gian kết thúc (End)
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color={isValid ? "success.main" : "error.main"}
                  sx={{ ml: 3 }}
                >
                  {formatDate(endDate)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}