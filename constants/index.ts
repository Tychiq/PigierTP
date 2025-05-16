export const navItems = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/",
  },
  {
    name: "Documents",
    icon: "/assets/icons/documents.svg",
    url: "/documents",
  },
  {
    name: "Images",
    icon: "/assets/icons/images.svg",
    url: "/images",
  },
  {
    name: "Médias",
    icon: "/assets/icons/video.svg",
    url: "/media",
  },
  {
    name: "Autres",
    icon: "/assets/icons/others.svg",
    url: "/others",
  },
];

export const navNav = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/student",
  },
];

export const actionsDropdownItems = [
  {
    label: "Renommer",
    icon: "/assets/icons/edit.svg",
    value: "renommer",
  },
  {
    label: "Details",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  
  {
    label: "Télécharger",
    icon: "/assets/icons/download.svg",
    value: "télécharger",
  },
  {
    label: "Supprimer",
    icon: "/assets/icons/delete.svg",
    value: "supprimer",
  },
];

export const sortTypes = [
  {
    label: "Date de création (plus récente)",
    value: "$createdAt-desc",
  },
  {
    label: "Date de création (plus ancienne",
    value: "$createdAt-asc",
  },
  {
    label: "Nom (A-Z)",
    value: "name-asc",
  },
  {
    label: "Nom (Z-A)",
    value: "name-desc",
  },
  {
    label: "Taille (Plus grande)",
    value: "size-desc",
  },
  {
    label: "Taille (Plus petite)",
    value: "size-asc",
  },
];

export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
