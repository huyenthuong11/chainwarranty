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
  Divider,
} from "@mui/material";

import Search from "@mui/icons-material/Search";
import QrCodeScanner from "@mui/icons-material/QrCodeScanner";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import HighlightOff from "@mui/icons-material/HighlightOff";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Error from "@mui/icons-material/Error";
import Inventory2 from "@mui/icons-material/Inventory2";
import Person from "@mui/icons-material/Person";
import Business from "@mui/icons-material/Business";

import {
  CHAIN_WARRANTY_ABI,
  CHAIN_WARRANTY_ADDRESS,
} from "../../contracts/chainWarranty";

const formatDate = (timestamp: bigint | number) => {
  if (!timestamp || Number(timestamp) === 0) {
    return "Chưa kích hoạt";
  }

  return new Date(Number(timestamp) * 1000).toLocaleString("vi-VN");
};

const shortenAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function ProductLookup() {
  const [searchInput, setSearchInput] = useState("");
  const [activeProductId, setActiveProductId] = useState("");

  // Lấy thông tin sản phẩm
  const {
    data: productData,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "getProduct",
    args: [activeProductId],
    query: {
      enabled: activeProductId.length > 0,
    },
  });

  // Kiểm tra trạng thái bảo hành
  const {
    data: warrantyData,
    isLoading: isWarrantyLoading,
    isError: isWarrantyError,
  } = useReadContract({
    address: CHAIN_WARRANTY_ADDRESS,
    abi: CHAIN_WARRANTY_ABI,
    functionName: "verifyWarranty",
    args: [activeProductId],
    query: {
      enabled: activeProductId.length > 0,
    },
  });

  const isLoading = isProductLoading || isWarrantyLoading;
  const isError = isProductError || isWarrantyError;

  const warrantyResult = warrantyData as
    | [boolean, bigint, bigint]
    | undefined;
  const isValid = warrantyResult?.[0] ?? false;
  const imageUrl = productData?.imageCID
  ? `https://gateway.pinata.cloud/ipfs/${productData.imageCID}`
  : "";
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchInput.trim()) {
      setActiveProductId(searchInput.trim());
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
      {/* Header */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ mb: 0.5, color: "#111827" }}
      >
        Tra cứu sản phẩm
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2.5 }}
      >
        Nhập mã sản phẩm hoặc quét mã QR để xác thực sản phẩm và
        kiểm tra bảo hành
      </Typography>

      {/* Search */}
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
          transition: "all 0.2s ease-in-out",
          "&:focus-within": {
            borderColor: "#4F46E5",
            boxShadow: "0 0 0 3px #EEF2FF",
          },
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: "14px" }}
          placeholder="Nhập mã sản phẩm (Ví dụ: CW001)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Tooltip title="Quét mã QR">
          <IconButton sx={{ p: "10px", color: "#6B7280" }}>
            <QrCodeScanner />
          </IconButton>
        </Tooltip>

        <IconButton
          type="submit"
          sx={{ p: "10px", color: "#4F46E5" }}
        >
          <Search />
        </IconButton>
      </Paper>

      {/* Loading */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
            gap: 1.5,
          }}
        >
          <CircularProgress size={20} sx={{ color: "#4F46E5" }} />

          <Typography variant="body2" color="text.secondary">
            Đang xác thực trên Blockchain...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <Alert
          severity="error"
          icon={<Error />}
          sx={{ mt: 2.5, borderRadius: 2 }}
        >
          Không tìm thấy sản phẩm hoặc mã sản phẩm không hợp lệ.
        </Alert>
      )}

      {/* Result */}
      {productData &&
        warrantyResult &&
        !isLoading &&
        !isError && (
          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2.5,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: isValid ? "#86EFAC" : "#FECACA",
              bgcolor: isValid ? "#F0FDF4" : "#FEF2F2",
            }}
          >
            {/* Warranty Status */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, mr: 2 }}>
                {isValid ? (
                  <VerifiedUser
                    sx={{ color: "#16A34A", fontSize: 28 }}
                  />
                ) : (
                  <HighlightOff
                    sx={{ color: "#EF4444", fontSize: 28 }}
                  />
                )}

                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color={isValid ? "#166534" : "#991B1B"}
                  >
                    {productData.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color={isValid ? "#15803D" : "#B91C1C"}
                  >
                    {isValid
                      ? "Bảo hành đang hoạt động"
                      : "Bảo hành đã hết hạn / chưa kích hoạt"}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={isValid ? "VALID" : "INVALID"}
                color={isValid ? "success" : "error"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Product Image */}
            {imageUrl && (
              <Box
                sx={{
                  mb: 2.5,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={productData.name}
                  sx={{
                    width: "100%",
                    maxWidth: 320,
                    height: 220,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                    bgcolor: "#FFFFFF",
                    p: 1,
                  }}
                />
              </Box>
            )}
            {/* Product Information */}
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Inventory2 sx={{ fontSize: 19, color: "#4F46E5" }} />

              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="#111827"
              >
                Thông tin sản phẩm
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                mb: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Product ID
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {productData.productId}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Model
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {productData.model}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Manufacturer
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business
                      sx={{ fontSize: 16, color: "#6B7280" }}
                    />

                    <Typography variant="body2" fontWeight={600}>
                      {shortenAddress(productData.manufacturer)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Current Owner
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person
                      sx={{ fontSize: 16, color: "#6B7280" }}
                    />

                    <Typography variant="body2" fontWeight={600}>
                      {shortenAddress(productData.owner)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Warranty */}
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <CalendarMonth
                sx={{ fontSize: 19, color: "#4F46E5" }}
              />

              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="#111827"
              >
                Thời hạn bảo hành
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Bắt đầu
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(warrantyResult[1])}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Kết thúc
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={isValid ? "success.main" : "error.main"}
                  >
                    {formatDate(warrantyResult[2])}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        )}
    </Box>
  );
}