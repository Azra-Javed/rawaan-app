import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Toast } from "react-native-toast-notifications";
import api from "@/api/client";
import ScreenHeader from "@/components/common/screen-header";
import RouteDots from "@/components/common/route-dots";
import color from "@/themes/app.colors";

const displayFont = "TT-Octosquares-Medium";
const palette = color;
type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I book a ride?",
    answer:
      "Open Home, tap the search bar, enter your destination, and choose from the drivers nearby.",
  },
  {
    question: "How do I pay my driver?",
    answer:
      "Rawaan runs on cash for now. Pay your driver directly once you reach your destination.",
  },
  {
    question: "What if my driver doesn't show up?",
    answer:
      "Cancel the ride and request a new one. If it keeps happening, report it below and we'll look into it.",
  },
  {
    question: "How is the fare calculated?",
    answer:
      "Distance between pickup and drop-off, multiplied by the driver's rate.",
  },
  {
    question: "How do I change my saved addresses?",
    answer:
      "Head to Profile → Saved Addresses to add, edit, or remove locations.",
  },
];

export default function ServicesScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const openWhatsApp = () => {
    const phoneNumber = "923000000000";
    Linking.openURL(`https://wa.me/${phoneNumber}`).catch(() => {
      Toast.show("Could not open WhatsApp", { type: "danger" });
    });
  };

  const openEmail = () => {
    Linking.openURL("mailto:iamazrajaved@gmail.com").catch(() => {
      Toast.show("Could not open email app", { type: "danger" });
    });
  };

  const callSupport = () => {
    Linking.openURL("tel:+923000000000").catch(() => {
      Toast.show("Could not open dialer", { type: "danger" });
    });
  };

  const submitReport = async () => {
    if (!reportText.trim()) {
      Toast.show("Please describe your issue", { type: "warning" });
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/user/report-issue", { message: reportText.trim() });
      Toast.show("Report submitted. We'll get back to you soon.", {
        type: "success",
      });
      setReportText("");
      setReportModalVisible(false);
    } catch (error) {
      console.log("Report submission error:", error);
      Toast.show("Failed to submit report. Please try again.", {
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        eyebrow="RAWAAN CARE"
        title="How can we help?"
        subtitle="We usually reply within the hour"
        icon="help-circle-outline"
        showDots
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------- Quick contact ---------------- */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={callSupport}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.contactIconCircle,
                { backgroundColor: palette.nightIndigo },
              ]}
            >
              <Ionicons name="call-outline" size={18} color={palette.white} />
            </View>
            <Text style={styles.contactLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={openWhatsApp}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.contactIconCircle,
                { backgroundColor: palette.moss },
              ]}
            >
              <Ionicons name="logo-whatsapp" size={18} color={palette.white} />
            </View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={openEmail}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.contactIconCircle,
                { backgroundColor: palette.routeAmber },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={palette.nightIndigo}
              />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- FAQ ---------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Frequently asked</Text>
          <RouteDots colorValue={color.ivoryLine} count={4} />
        </View>

        {FAQ_DATA.map((item, index) => {
          const isOpen = expandedIndex === index;
          return (
            <TouchableOpacity
              key={item.question}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.85}
              style={[styles.faqCard, isOpen && styles.faqCardOpen]}
            >
              <View style={styles.faqHeaderRow}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons
                  name={isOpen ? "remove-circle" : "add-circle-outline"}
                  size={22}
                  color={isOpen ? palette.routeAmber : palette.slateTeal}
                />
              </View>

              {isOpen && (
                <View style={styles.faqAnswerRow}>
                  <View style={styles.faqAnswerBar} />
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* ---------------- Report an issue ---------------- */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
          activeOpacity={0.9}
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={palette.white}
          />
          <Text style={styles.reportButtonText}>Report an issue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------------- Report modal ---------------- */}
      <Modal
        transparent={true}  
        visible={reportModalVisible}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Report an issue</Text>
            <RouteDots count={5} />

            <TextInput
              value={reportText}
              onChangeText={setReportText}
              placeholder="Tell us what happened..."
              placeholderTextColor={palette.slateTeal}
              multiline
              numberOfLines={5}
              style={styles.modalInput}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.modalCancelButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitReport}
                disabled={submitting}
                style={styles.modalSubmitButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitText}>
                  {submitting ? "Sending..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ---------- Header ----------
  header: {
    paddingTop: windowHeight(56),
    paddingBottom: windowHeight(26),
    paddingHorizontal: windowWidth(22),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: palette.routeAmber,
    opacity: 0.14,
  },
  eyebrow: {
    color: palette.routeAmber,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: displayFont,
    color: palette.white,
    fontSize: 26,
    lineHeight: 32,
  },
  headerSubtitle: {
    color: "#C7CBDB",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
  },

  // ---------- Route dots (signature motif) ----------
  routeDotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  // ---------- Body ----------
  body: {
    padding: windowWidth(20),
    paddingBottom: windowHeight(50),
  },

  // ---------- Contact cards ----------
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: windowHeight(28),
  },
  contactCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 18,
    paddingVertical: windowHeight(16),
    marginHorizontal: windowWidth(5),
    borderWidth: 1,
    borderColor: palette.ivoryLine,
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.nightIndigo,
  },

  // ---------- Section header ----------
  sectionHeaderRow: {
    marginBottom: windowHeight(14),
  },
  sectionTitle: {
    fontFamily: displayFont,
    fontSize: 17,
    color: palette.nightIndigo,
    marginBottom: 8,
  },

  // ---------- FAQ cards ----------
  faqCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: windowWidth(16),
    marginBottom: windowHeight(10),
    borderWidth: 1,
    borderColor: palette.ivoryLine,
  },
  faqCardOpen: {
    borderColor: palette.routeAmber,
  },
  faqHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: palette.nightIndigo,
    paddingRight: 10,
  },
  faqAnswerRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  faqAnswerBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: palette.routeAmber,
    marginRight: 10,
  },
  faqAnswer: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: palette.slateTeal,
  },

  // ---------- Report button ----------
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.coral,
    borderRadius: 999,
    paddingVertical: windowHeight(15),
    marginTop: windowHeight(10),
    gap: 8,
  },
  reportButtonText: {
    color: palette.white,
    fontWeight: "700",
    fontSize: 15,
  },

  // ---------- Modal ----------
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#171B3499",
  },
  modalSheet: {
    backgroundColor: palette.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: windowWidth(22),
    paddingTop: windowHeight(12),
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.ivoryLine,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: displayFont,
    fontSize: 18,
    color: palette.nightIndigo,
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.ivoryLine,
    borderRadius: 14,
    padding: windowWidth(14),
    marginTop: windowHeight(16),
    textAlignVertical: "top",
    minHeight: windowHeight(110),
    fontSize: 14,
    color: palette.nightIndigo,
  },
  modalButtonRow: {
    flexDirection: "row",
    marginTop: windowHeight(16),
  },
  modalCancelButton: {
    flex: 1,
    marginRight: windowWidth(8),
    paddingVertical: windowHeight(14),
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.nightIndigo,
  },
  modalCancelText: {
    fontWeight: "700",
    color: palette.nightIndigo,
  },
  modalSubmitButton: {
    flex: 1,
    marginLeft: windowWidth(8),
    paddingVertical: windowHeight(14),
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: palette.coral,
  },
  modalSubmitText: {
    color: palette.white,
    fontWeight: "700",
  },
});
