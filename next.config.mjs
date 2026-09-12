/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/residential-property", destination: "/properties?propertyType=FLAT", permanent: false },
      { source: "/commercial-property", destination: "/categories/commercial", permanent: false },
      { source: "/luxury-properties", destination: "/categories/luxury", permanent: false },
      { source: "/plots", destination: "/properties?propertyType=PLOT", permanent: false },
      { source: "/flats", destination: "/categories/apartment", permanent: false },
      { source: "/villas", destination: "/categories/villas", permanent: false },
      { source: "/property-in-gurugram", destination: "/properties?city=Gurugram", permanent: false },
      { source: "/property-in-delhi", destination: "/properties?city=Delhi", permanent: false },
      { source: "/property-in-noida", destination: "/properties?city=Noida", permanent: false },
      { source: "/property-in-greater-noida", destination: "/properties?city=Greater+Noida", permanent: false },
      { source: "/property-in-faridabad", destination: "/properties?city=Faridabad", permanent: false },
      { source: "/property-in-dubai", destination: "/properties?city=Dubai", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
      ],
    }];
  },
};

export default nextConfig;
