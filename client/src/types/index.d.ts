import { LucideIcon } from "lucide-react";
import { AuthUser } from "aws-amplify/auth";
import { Manager, Tenant, Property, Application } from "./prismaTypes";
import { MotionProps as OriginalMotionProps } from "framer-motion";

declare module "framer-motion" {
  interface MotionProps extends OriginalMotionProps {
    className?: string;
  }
}

declare global {
  enum AmenityEnum {
    WasherDryer = "WasherDryer",
    AirConditioning = "AirConditioning",
    Dishwasher = "Dishwasher",
    HighSpeedInternet = "HighSpeedInternet",
    HardwoodFloors = "HardwoodFloors",
    WalkInClosets = "WalkInClosets",
    Microwave = "Microwave",
    Refrigerator = "Refrigerator",
    Pool = "Pool",
    Gym = "Gym",
    Parking = "Parking",
    PetsAllowed = "PetsAllowed",
    WiFi = "WiFi",
  }

  enum HighlightEnum {
    HighSpeedInternetAccess = "HighSpeedInternetAccess",
    WasherDryer = "WasherDryer",
    AirConditioning = "AirConditioning",
    Heating = "Heating",
    SmokeFree = "SmokeFree",
    CableReady = "CableReady",
    SatelliteTV = "SatelliteTV",
    DoubleVanities = "DoubleVanities",
    TubShower = "TubShower",
    Intercom = "Intercom",
    SprinklerSystem = "SprinklerSystem",
    RecentlyRenovated = "RecentlyRenovated",
    CloseToTransit = "CloseToTransit",
    GreatView = "GreatView",
    QuietNeighborhood = "QuietNeighborhood",
  }

  enum PropertyTypeEnum {
    Rooms = "Rooms",
    Tinyhouse = "Tinyhouse",
    Apartment = "Apartment",
    Villa = "Villa",
    Townhouse = "Townhouse",
    Cottage = "Cottage",
  }

  enum CampusZoneEnum {
    Tanke = "Tanke",
    Sanrab = "Sanrab",
    OkeOdo = "OkeOdo",
    Jalala = "Jalala",
    MarkJunction = "MarkJunction",
    Other = "Other",
  }

  enum ApplicationStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    LEASE_PENDING = "LEASE_PENDING",
  }

  enum LeaseStatusEnum {
    DRAFT = "DRAFT",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    ACTIVE = "ACTIVE",
    TERMINATED = "TERMINATED",
    EXPIRED = "EXPIRED",
  }

  enum EscrowStatusEnum {
    HELD = "HELD",
    DISBURSED_TO_LANDLORD = "DISBURSED_TO_LANDLORD",
    REFUNDED_TO_TENANT = "REFUNDED_TO_TENANT",
    DISPUTED = "DISPUTED",
  }

  enum TransactionTypeEnum {
    PLATFORM_FEE = "PLATFORM_FEE",
    CAUTION_DEPOSIT = "CAUTION_DEPOSIT",
    AGENT_COMMISSION = "AGENT_COMMISSION",
    FULL_RENT = "FULL_RENT",
  }

  enum TransactionStatusEnum {
    INITIALIZED = "INITIALIZED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
  }

  enum PaymentProviderEnum {
    PAYSTACK = "PAYSTACK",
  }

  interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
  }

  interface PropertyOverviewProps {
    propertyId: number;
  }

  interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: number;
  }

  interface ContactWidgetProps {
    onOpenModal: () => void;
  }

  interface ImagePreviewsProps {
    images: string[];
  }

  interface PropertyDetailsProps {
    propertyId: number;
  }

  interface PropertyOverviewProps {
    propertyId: number;
  }

  interface PropertyLocationProps {
    propertyId: number;
  }

  interface ApplicationCardProps {
    application: Application;
    userType: "manager" | "renter";
    children: React.ReactNode;
  }

  interface CardProps {
    property: Property & { distanceKm?: number };
    isFavorite: boolean;
    onFavoriteToggle: () => void;
    showFavoriteButton?: boolean;
    propertyLink?: string;
    isHovered?: boolean;
  }

  interface CardCompactProps {
    property: Property & { distanceKm?: number };
    isFavorite: boolean;
    onFavoriteToggle: () => void;
    showFavoriteButton?: boolean;
    propertyLink?: string;
    isHovered?: boolean;
  }

  interface HeaderProps {
    title: string;
    subtitle: string;
  }

  interface NavbarProps {
    isDashboard: boolean;
  }

  interface AppSidebarProps {
    userType: "manager" | "tenant";
  }

  interface SettingsFormProps {
    initialData: SettingsFormData;
    onSubmit: (data: SettingsFormData) => Promise<void>;
    userType: "manager" | "tenant";
  }

  interface LeaseLifecycle {
    leaseId: number;
    totalDays: number;
    daysElapsed: number;
    daysRemaining: number;
    percentCompleted: number;
    statusLabel: string;
    escrowStatus: string;
    cautionDeposit: number;
    isExpiringSoon: boolean;
    isEligibleForMoveOutInspection: boolean;
    startDate: string;
    endDate: string;
    paidAt?: string | null;
  }

  interface User {
    cognitoInfo: AuthUser;
    userInfo: Tenant | Manager;
    userRole: JsonObject | JsonPrimitive | JsonArray;
  }
}

export {};
