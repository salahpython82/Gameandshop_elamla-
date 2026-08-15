import React, { useState } from "react";
import { MarketOrder, UserProfile, PlayerStore } from "../types";
import { soundFx } from "../utils/sound";
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  CreditCard,
  Building,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
} from "lucide-react";

interface StoreOrdersManagementModalProps {
  orders: MarketOrder[];
  currentUser: UserProfile;
  playerStore?: PlayerStore | null;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: MarketOrder["orderStatus"]) => void;
}

export const StoreOrdersManagementModal: React.FC<StoreOrdersManagementModalProps> = ({
  orders,
  currentUser,
  playerStore,
  onClose,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("purchases");

  const myPurchases = orders.filter(
    (o) =>
      o.buyerEmail.toLowerCase() === (currentUser.email || "guest").toLowerCase() ||
      o.buyerName === currentUser.name
  );

  const incomingSales = orders.filter(
    (o) =>
      (playerStore && o.storeName === playerStore.storeName) ||
      (currentUser.email && o.sellerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const displayedOrders = activeTab === "purchases" ? myPurchases : incomingSales;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-200">
                سجل الطلبات والمبيعات والشحن
              </h2>
              <p className="text-xs text-slate-400">
                تتبع حالة التوصيل، الفواتير، وطرق الدفع (بريد موب / عند الاستلام / كارد)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("purchases");
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeTab === "purchases"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🛍️ مشترياتي من المسكوكات</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30">
              {myPurchases.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("sales");
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeTab === "sales"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🏪 مبيعات متجري والطلبات الواردة</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30">
              {incomingSales.length}
            </span>
          </button>
        </div>

        {/* Seller Financial Summary Bar (If in sales tab and has sales) */}
        {activeTab === "sales" && incomingSales.length > 0 && (
          <div className="mx-5 mt-4 p-3 bg-gradient-to-r from-amber-950/30 via-slate-950 to-emerald-950/30 rounded-2xl border border-amber-500/20 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">إجمالي حجم المبيعات</span>
              <span className="font-bold text-slate-100">
                {incomingSales.reduce((acc, o) => acc + o.priceDzd, 0).toLocaleString()} د.ج
              </span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-amber-500/30">
              <span className="text-[10px] text-amber-400 block font-bold">اقتطاع مالك التطبيق (100 د.ج/عملية)</span>
              <span className="font-bold text-amber-300">
                {(incomingSales.length * 100).toLocaleString()} د.ج
              </span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 block font-bold">صافي أرباح المتجر</span>
              <span className="font-black text-emerald-400">
                {incomingSales
                  .reduce((acc, o) => acc + (o.sellerPayoutDzd || Math.max(0, o.priceDzd - 100)), 0)
                  .toLocaleString()} د.ج
              </span>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-300 text-sm">لا توجد طلبات مسجلة حالياً</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === "purchases"
                  ? "تصفح سوق ومتاجر اللاعبين واختر قطعتك النقدية الأثرية المفضلة لإتمام شرائها."
                  : "عندما يقوم لاعب بطلب قطعة من متجرك، ستظهر تفاصيل الشحن والدفع هنا مباشرة."}
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {order.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100">{order.listingTitle}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      المتجر: <strong className="text-amber-200">{order.storeName}</strong> • التاريخ: {order.createdAt}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 border ${
                      order.orderStatus === "تم الاستلام بنجاح"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : order.orderStatus === "تم الشحن مع شركة التوصيل"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : order.orderStatus === "تم الدفع وتجهيز الطرد"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">طريقة الدفع:</span>
                    <p className="font-bold text-slate-100 mt-0.5">
                      {order.paymentMethod === "baridimob"
                        ? "📲 بريد موب (BaridiMob)"
                        : order.paymentMethod === "cod"
                        ? "🤝 الدفع عند الاستلام"
                        : "💳 ماستر كارد / فيزا"}
                    </p>
                    {order.baridiMobTransactionRef && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        مرجع: {order.baridiMobTransactionRef}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">المبلغ الإجمالي للمسكوك:</span>
                    <p className="font-black text-amber-300 text-sm mt-0.5">
                      {order.priceDzd.toLocaleString()} د.ج
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">رقم التتبع والشحن:</span>
                    <p className="font-mono font-bold text-emerald-400 mt-0.5">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>

                {/* Fee & Net Breakdown Strip */}
                <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>اقتطاع خدمة المنصة لمالك التطبيق: <strong>{(order.platformFeeDzd || 100).toLocaleString()} د.ج</strong></span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    صافي مستحقات البائع: <strong className="text-emerald-400">{(order.sellerPayoutDzd || Math.max(0, order.priceDzd - 100)).toLocaleString()} د.ج</strong>
                  </div>
                </div>

                {/* Shipping & Contact Info */}
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">المشتري: </span>
                    <span className="font-bold text-slate-200">{order.buyerName}</span>
                    <span className="text-slate-400 mr-2">({order.buyerAddressWilaya})</span>
                  </div>

                  <a
                    href={`tel:${order.buyerPhone}`}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{order.buyerPhone}</span>
                  </a>
                </div>

                {/* Seller Actions (If in incoming sales tab) */}
                {activeTab === "sales" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {order.orderStatus === "قيد المراجعة" && (
                      <button
                        onClick={() => {
                          soundFx.playCoin();
                          onUpdateOrderStatus(order.id, "تم الدفع وتجهيز الطرد");
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition"
                      >
                        تأكيد استلام الدفعة وتجهيز الطرد ✅
                      </button>
                    )}

                    {order.orderStatus === "تم الدفع وتجهيز الطرد" && (
                      <button
                        onClick={() => {
                          soundFx.playCoin();
                          onUpdateOrderStatus(order.id, "تم الشحن مع شركة التوصيل");
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>تسليم الطرد لشركة التوصيل 🚚</span>
                      </button>
                    )}

                    {order.orderStatus === "تم الشحن مع شركة التوصيل" && (
                      <button
                        onClick={() => {
                          soundFx.playVictory();
                          onUpdateOrderStatus(order.id, "تم الاستلام بنجاح");
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد إتمام التسليم للمشتري 🤝</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
