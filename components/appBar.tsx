import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import { Button, Link, Typography } from "@mui/material";

export default function PrimaryAppBar() {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const navLinks = [
    { href: "/", label: "Sign up" },
    { href: "/global-leaderboard", label: "Global Leaderboard" },
    { href: "/leaderboards", label: "Leaderboards" },
  ];

  const mobileMenuId = "primary-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      slotProps={{
        paper: {
          sx: {
            mt: 0.5,
            minWidth: 200,
            border: "1px solid rgba(255,255,255,0.1)",
          },
        },
      }}
    >
      {navLinks.map((link) => (
        <MenuItem
          key={link.href}
          onClick={handleMobileMenuClose}
          component="a"
          href={link.href}
          sx={{ fontSize: "0.9rem", py: 1.5 }}
        >
          {link.label}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          {/* Brand */}
          <Typography
            component="a"
            href="/"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "primary.main",
              textDecoration: "none",
              letterSpacing: "-0.02em",
              mr: 2,
            }}
          >
            Quit League
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                href={link.href}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary", bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-label="open menu"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{ color: "text.secondary" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
  );
}
