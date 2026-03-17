import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import WinningTickets from "./pages/WinningTickets";
import WinningTicketDetail from "./pages/WinningTicketDetail";
import Exchange from "./pages/Exchange";
import Points from "./pages/Points";
import LuckyDraw from "./pages/LuckyDraw";
import MyPage from "./pages/MyPage";
import TicketDetail from "./pages/TicketDetail";
import RubyTicketDetail from "./pages/RubyTicketDetail";
import JewelryTicketDetail from "./pages/JewelryTicketDetail";
import MeatTicketDetail from "./pages/MeatTicketDetail";
import BeautyTicketDetail from "./pages/BeautyTicketDetail";
import PlatinumTicketDetail from "./pages/PlatinumTicketDetail";
import DiamondTicketDetail from "./pages/DiamondTicketDetail";
import GoldTicketDetail from "./pages/GoldTicketDetail";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/login/callback",
    Component: LoginCallback,
  },
  {
    path: "/payment/success",
    Component: PaymentSuccess,
  },
  {
    path: "/payment/fail",
    Component: PaymentFail,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/winning-tickets",
    Component: WinningTickets,
  },
  {
    path: "/winning-ticket/:id",
    Component: WinningTicketDetail,
  },
  {
    path: "/exchange",
    Component: Exchange,
  },
  {
    path: "/points",
    Component: Points,
  },
  {
    path: "/lucky-draw",
    Component: LuckyDraw,
  },
  {
    path: "/my-page",
    Component: MyPage,
  },
  {
    path: "/ticket/ruby",
    Component: RubyTicketDetail,
  },
  {
    path: "/tickets/ruby",
    Component: RubyTicketDetail,
  },
  {
    path: "/ticket/jewelry",
    Component: JewelryTicketDetail,
  },
  {
    path: "/tickets/jewelry",
    Component: JewelryTicketDetail,
  },
  {
    path: "/ticket/meat",
    Component: MeatTicketDetail,
  },
  {
    path: "/tickets/meat",
    Component: MeatTicketDetail,
  },
  {
    path: "/ticket/beauty",
    Component: BeautyTicketDetail,
  },
  {
    path: "/tickets/beauty",
    Component: BeautyTicketDetail,
  },
  {
    path: "/ticket/platinum",
    Component: PlatinumTicketDetail,
  },
  {
    path: "/tickets/platinum",
    Component: PlatinumTicketDetail,
  },
  {
    path: "/ticket/diamond",
    Component: DiamondTicketDetail,
  },
  {
    path: "/tickets/diamond",
    Component: DiamondTicketDetail,
  },
  {
    path: "/ticket/gold",
    Component: GoldTicketDetail,
  },
  {
    path: "/tickets/gold",
    Component: GoldTicketDetail,
  },
  {
    path: "/ticket/:ticketType",
    Component: TicketDetail,
  },
]);