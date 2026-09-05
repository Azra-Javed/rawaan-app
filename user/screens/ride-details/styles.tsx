import color from "@/themes/app.colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  mapContainer: {
    height: "48%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: color.nightIndigo,
  },

  map: {
    flex: 1,
  },

  mapBackButton: {
    position: "absolute",
    top: 18,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  attribution: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  attributionText: {
    fontSize: 7.5,
    color: color.muted,
  },

  routeLoading: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },

  routeLoadingText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "600",
    color: color.nightIndigo,
  },

  detailsContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: color.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  detailsContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: color.border,
    marginBottom: 17,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: color.buttonBg,
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.tealSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#31A46C",
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
    color: color.nightIndigo,
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },

  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  driverInfo: {
    flex: 1,
  },

  driverLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: color.nightIndigo,
    alignItems: "center",
    justifyContent: "center",
  },

  callButtonDisabled: {
    backgroundColor: color.border,
  },

  detailsCard: {
    backgroundColor: color.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 13,
    marginBottom: 14,
  },

  detailRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailText: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: color.nightIndigo,
  },

  phoneValue: {
    color: color.buttonBg,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "800",
    color: color.buttonBg,
    paddingHorizontal: 5,
  },

  divider: {
    height: 1,
    backgroundColor: color.border,
    marginLeft: 46,
  },

  vehicleColor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.ivory,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  colorDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  vehicleColorText: {
    fontSize: 9,
    fontWeight: "600",
    color: color.muted,
    maxWidth: 55,
  },

  paymentSection: {
    backgroundColor: color.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: color.border,
    padding: 15,
    marginBottom: 12,
  },

  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  paymentTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.buttonBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  paidText: {
    fontSize: 9,
    fontWeight: "800",
    color: color.white,
    marginLeft: 3,
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paymentLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  paymentAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paymentCurrency: {
    fontSize: 11,
    fontWeight: "800",
    color: color.muted,
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.nightIndigo,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
  },

  payButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: color.white,
    marginRight: 7,
  },

  paymentSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },

  paymentSuccessText: {
    fontSize: 10,
    fontWeight: "600",
    color: color.muted,
    marginLeft: 6,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  noteText: {
    fontSize: 9.5,
    color: color.muted,
    marginLeft: 5,
  },

  emptyScreen: {
    flex: 1,
    backgroundColor: color.ivory,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: color.nightIndigo,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 11,
    color: color.muted,
    textAlign: "center",
    marginTop: 6,
  },

  backButtonEmpty: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.nightIndigo,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 20,
  },

  backButtonText: {
    color: color.white,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,76,74,0.35)",
  },

  paymentModal: {
    backgroundColor: color.ivory,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 28,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: color.border,
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  modalSubtitle: {
    fontSize: 10.5,
    color: color.muted,
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },

  modalAmountBox: {
    backgroundColor: color.white,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },

  modalAmountLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  modalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  modalCurrency: {
    fontSize: 11,
    color: color.muted,
  },

  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: color.border,
    padding: 12,
    marginBottom: 9,
  },

  paymentMethodSelected: {
    borderColor: color.buttonBg,
    backgroundColor: color.tealSoft,
  },

  paymentMethodIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  paymentMethodText: {
    flex: 1,
  },

  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paymentMethodSubtitle: {
    fontSize: 9.5,
    color: color.muted,
    marginTop: 2,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: color.buttonBg,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.buttonBg,
  },

  confirmPaymentButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: color.nightIndigo,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  confirmPaymentText: {
    color: color.white,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 7,
  },

  ratingOverlay: {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(15, 76, 74, 0.35)",
},

ratingModal: {
  backgroundColor: color.ivory,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 20,
  paddingTop: 9,
  paddingBottom: 28,
  alignItems: "center",
},

ratingIcon: {
  width: 58,
  height: 58,
  borderRadius: 20,
  backgroundColor: "#FFF4DC",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 5,
  marginBottom: 12,
},

ratingTitle: {
  fontSize: 21,
  fontWeight: "800",
  color: color.nightIndigo,
  textAlign: "center",
},

ratingSubtitle: {
  fontSize: 10.5,
  lineHeight: 16,
  color: color.muted,
  textAlign: "center",
  marginTop: 5,
  maxWidth: 280,
},

ratingDriver: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: color.white,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: color.border,
  padding: 12,
  marginTop: 18,
},

ratingDriverAvatar: {
  width: 43,
  height: 43,
  borderRadius: 14,
  backgroundColor: color.tealSoft,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

ratingDriverInfo: {
  flex: 1,
},

ratingDriverLabel: {
  fontSize: 8,
  fontWeight: "800",
  letterSpacing: 1,
  color: color.muted,
  marginBottom: 3,
},

ratingDriverName: {
  fontSize: 14,
  fontWeight: "800",
  color: color.nightIndigo,
},

starsContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 21,
},

starButton: {
  paddingHorizontal: 3,
},

ratingText: {
  marginTop: 8,
  fontSize: 11,
  fontWeight: "700",
  color: color.nightIndigo,
},

submitRatingButton: {
  width: "100%",
  height: 48,
  borderRadius: 14,
  backgroundColor: color.nightIndigo,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 19,
},

submitRatingButtonDisabled: {
  opacity: 0.45,
},

submitRatingText: {
  fontSize: 12,
  fontWeight: "800",
  color: color.white,
  marginRight: 7,
},
});

export default styles;