// Shared field config — used by the create-listing form, validators, and filters.
// Keep purpose/type enums in sync with prisma/schema.prisma

export const PURPOSES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

export const PROPERTY_TYPES_BY_PURPOSE = {
  SALE: [
    { value: "HOUSE", label: "House" },
    { value: "PLOT", label: "Plot" },
    { value: "FLAT", label: "Flat" },
    { value: "SHOP", label: "Shop" },
    { value: "SHOWROOM", label: "Showroom" },
    { value: "GODOWN", label: "Godown" },
    { value: "OFFICE", label: "Office" },
  ],
  RENT: [
    { value: "OFFICE", label: "Office Space" },
    { value: "FLAT", label: "Flat" },
    { value: "PG", label: "PG" },
    { value: "SHOP", label: "Shop" },
    { value: "SHOWROOM", label: "Showroom" },
  ],
};

// Fields required to publish any listing, regardless of type
export const MANDATORY_FIELDS = [
  "title",
  "purpose",
  "propertyType",
  "postedBy",
  "city",
  "area",
  "price",
  "contactNumber",
  "photos",
];

// Everything else is optional — grouped for the form UI
export const OPTIONAL_FIELD_GROUPS = [
  {
    label: "Size & dimensions",
    fields: [
      { name: "sizeValue", label: "Size", type: "number" },
      {
        name: "sizeUnit",
        label: "Unit",
        type: "select",
        options: ["sqft", "sqyard", "gaj", "acre"],
      },
      { name: "plotLength", label: "Plot length (ft)", type: "number" },
      { name: "plotWidth", label: "Plot width (ft)", type: "number" },
      {
        name: "facing",
        label: "Facing",
        type: "select",
        options: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"],
      },
      { name: "roadWidthFt", label: "Road width (ft)", type: "number" },
      { name: "isCornerPlot", label: "Corner plot", type: "boolean" },
    ],
  },
  {
    label: "Rooms & layout",
    fields: [
      { name: "bedrooms", label: "Bedrooms (BHK)", type: "number" },
      { name: "bathrooms", label: "Bathrooms", type: "number" },
      { name: "floorNumber", label: "Floor number", type: "number" },
      { name: "totalFloors", label: "Total floors", type: "number" },
      {
        name: "furnishing",
        label: "Furnishing",
        type: "select",
        options: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"],
      },
    ],
  },
  {
    label: "Legal & status",
    fields: [
      { name: "propertyAgeYears", label: "Property age (years)", type: "number" },
      {
        name: "possession",
        label: "Possession",
        type: "select",
        options: ["READY_TO_MOVE", "UNDER_CONSTRUCTION"],
      },
      {
        name: "ownershipType",
        label: "Ownership",
        type: "select",
        options: ["FREEHOLD", "LEASEHOLD", "POWER_OF_ATTORNEY"],
      },
      { name: "reraNumber", label: "RERA number", type: "text" },
      { name: "authorityApproved", label: "Development authority approved", type: "boolean" },
    ],
  },
  {
    label: "Amenities & extras",
    fields: [
      { name: "amenities", label: "Amenities (comma separated)", type: "tags" },
      { name: "nearbyLandmark", label: "Nearby landmark", type: "text" },
      { name: "negotiable", label: "Price negotiable", type: "boolean" },
      { name: "loanAvailable", label: "Bank loan available", type: "boolean" },
      { name: "description", label: "Additional description", type: "textarea" },
    ],
  },
];
