import { PlaceResult, searchPlaces } from "@/utils/photon";
import { useRef, useState } from "react";

import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import appFonts from "@/themes/app.fonts";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

type Props = {
  placeholder: string;
  onSelect: (place: PlaceResult) => void;
};

export default function PlaceSearchInput({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  /* --------------------------------------------------
     SEARCH
  -------------------------------------------------- */

  const handleChange = (text: string) => {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!text.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(text);
        setResults(places);
      } catch (error) {
        console.log("Photon place search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  /* --------------------------------------------------
     MODAL
  -------------------------------------------------- */

  const openSearchModal = () => {
    setIsModalVisible(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  };

  const closeSearchModal = () => {
    Keyboard.dismiss();
    setIsModalVisible(false);
  };

  /* --------------------------------------------------
     SELECT
  -------------------------------------------------- */

  const handleSelectPlace = (place: PlaceResult) => {
    setQuery(place.description);
    setResults([]);

    Keyboard.dismiss();

    setTimeout(() => {
      setIsModalVisible(false);
      onSelect(place);
    }, 100);
  };

  /* --------------------------------------------------
     CLEAR
  -------------------------------------------------- */

  const clearSearch = () => {
    setQuery("");
    setResults([]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <View style={styles.wrapper}>
      {/* =================================================
          MAIN DESTINATION FIELD
      ================================================= */}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openSearchModal}
        style={styles.destinationField}
      >
        <View style={styles.destinationSearchIcon}>
          <Ionicons name="search-outline" size={18} color="#176B68" />
        </View>

        <View style={styles.destinationTextContainer}>
          <Text
            style={[
              styles.destinationText,
              !query && styles.destinationPlaceholder,
            ]}
            numberOfLines={1}
          >
            {query || placeholder}
          </Text>
        </View>

        {query.length > 0 ? (
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation();
              clearSearch();
            }}
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={19} color="#A5B0B0" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={17} color="#B3BDBD" />
        )}
      </TouchableOpacity>

      {/* =================================================
          DESTINATION SEARCH MODAL
      ================================================= */}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeSearchModal}
      >
        <SafeAreaView style={styles.modal}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <TouchableOpacity
              onPress={closeSearchModal}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#132121" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerEyebrow}>RAWAAN</Text>

              <Text style={styles.headerTitle}>Where to?</Text>
            </View>
          </View>

          {/* =================================================
              SEARCH BOX
          ================================================= */}

          <View style={styles.searchSection}>
            <View
              style={[
                styles.searchBox,
                query.length > 0 && styles.searchBoxActive,
              ]}
            >
              <View style={styles.searchIconContainer}>
                <Ionicons name="search" size={19} color="#176B68" />
              </View>

              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={handleChange}
                placeholder={placeholder}
                placeholderTextColor="#9AA5A5"
                autoFocus
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="words"
                style={styles.searchInput}
                cursorColor="#176B68"
              />

              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#176B68"
                  style={styles.loader}
                />
              )}

              {!loading && query.length > 0 && (
                <TouchableOpacity onPress={clearSearch} hitSlop={10}>
                  <Ionicons name="close-circle" size={20} color="#A5B0B0" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchHint}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#9AA5A5"
              />

              <Text style={styles.searchHintText}>
                Search for a place, street or area
              </Text>
            </View>
          </View>

          {/* =================================================
              RESULTS
          ================================================= */}

          <View style={styles.resultsArea}>
            {/* SEARCHING */}
            {loading && (
              <View style={styles.loadingState}>
                <View style={styles.loadingIcon}>
                  <ActivityIndicator size="small" color="#176B68" />
                </View>

                <Text style={styles.loadingTitle}>Finding places</Text>

                <Text style={styles.loadingSubtitle}>
                  Searching nearby locations...
                </Text>
              </View>
            )}

            {/* RESULTS */}
            {!loading && results.length > 0 && (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsHeaderText}>SUGGESTED PLACES</Text>

                  <Text style={styles.resultsCount}>{results.length}</Text>
                </View>

                <FlatList
                  data={results}
                  keyExtractor={(item, index) =>
                    `${item.latitude}-${item.longitude}-${index}`
                  }
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode={
                    Platform.OS === "ios" ? "interactive" : "on-drag"
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.resultsList}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleSelectPlace(item)}
                      style={styles.placeRow}
                    >
                      {/* LOCATION ICON */}

                      <View style={styles.placeIcon}>
                        <Ionicons
                          name="location-outline"
                          size={19}
                          color="#176B68"
                        />
                      </View>

                      {/* PLACE INFO */}

                      <View style={styles.placeInfo}>
                        <Text style={styles.placeTitle} numberOfLines={1}>
                          {item.description.split(",")[0]}
                        </Text>

                        <Text style={styles.placeDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>

                      {/* ARROW */}

                      <View style={styles.placeArrow}>
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color="#B6C0C0"
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </>
            )}

            {/* NO RESULTS */}

            {!loading && query.trim().length > 0 && results.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="location-outline" size={30} color="#176B68" />
                </View>

                <Text style={styles.emptyTitle}>No places found</Text>

                <Text style={styles.emptySubtitle}>
                  Try searching with a different place name or street.
                </Text>
              </View>
            )}

            {/* INITIAL STATE */}

            {!loading && query.trim().length === 0 && (
              <View style={styles.initialState}>
                <View style={styles.initialIcon}>
                  <Ionicons name="navigate-outline" size={32} color="#176B68" />
                </View>

                <Text style={styles.initialTitle}>Choose your destination</Text>

                <Text style={styles.initialSubtitle}>
                  Start typing to find places near your destination.
                </Text>

                <View style={styles.tipCard}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="bulb-outline" size={16} color="#F5A524" />
                  </View>

                  <Text style={styles.tipText}>
                    You can search for restaurants, streets, landmarks and
                    areas.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ---------------------------------------------------------
     MAIN
  --------------------------------------------------------- */

  wrapper: {
    width: "100%",
  },

  destinationField: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F7F9F9",

    borderRadius: 14,

    paddingHorizontal: 10,

    borderWidth: 1,
    borderColor: "#E3EAEA",
  },

  destinationSearchIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  destinationTextContainer: {
    flex: 1,
  },

  destinationText: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT13,
    color: "#172525",
  },

  destinationPlaceholder: {
    color: "#929E9E",
  },

  /* ---------------------------------------------------------
     MODAL
  --------------------------------------------------------- */

  modal: {
    flex: 1,
    backgroundColor: "#FBFDFC",
  },

  /* ---------------------------------------------------------
     HEADER
  --------------------------------------------------------- */

  header: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,

    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#F3F6F6",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontFamily: appFonts.bold,
    fontSize: 9,
    letterSpacing: 1.4,

    color: "#F5A524",

    marginBottom: 1,
  },

  headerTitle: {
    fontFamily: appFonts.bold,
    fontSize: 21,

    color: "#132121",
  },

  /* ---------------------------------------------------------
     SEARCH
  --------------------------------------------------------- */

  searchSection: {
    backgroundColor: "#FFFFFF",

    paddingHorizontal: 16,
    paddingBottom: 14,

    borderBottomWidth: 1,
    borderBottomColor: "#E8EEEE",
  },

  searchBox: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F4F7F7",

    borderRadius: 15,

    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: "#E1E8E8",
  },

  searchBoxActive: {
    borderColor: "#B9DAD7",
    backgroundColor: "#F8FBFB",
  },

  searchIconContainer: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  searchInput: {
    flex: 1,

    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT14,

    color: "#132121",

    paddingVertical: 0,
  },

  loader: {
    marginLeft: 8,
  },

  searchHint: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 8,
    paddingHorizontal: 3,
  },

  searchHintText: {
    marginLeft: 5,

    fontFamily: appFonts.regular,
    fontSize: 10,

    color: "#98A3A3",
  },

  /* ---------------------------------------------------------
     RESULTS AREA
  --------------------------------------------------------- */

  resultsArea: {
    flex: 1,
    backgroundColor: "#FBFDFC",
  },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 9,
  },

  resultsHeaderText: {
    fontFamily: appFonts.bold,

    fontSize: 9,

    letterSpacing: 1.1,

    color: "#7C8989",
  },

  resultsCount: {
    minWidth: 22,
    height: 20,

    paddingHorizontal: 6,

    borderRadius: 10,

    backgroundColor: "#E7F2F1",

    textAlign: "center",
    textAlignVertical: "center",

    fontFamily: appFonts.bold,
    fontSize: 9,

    color: "#176B68",
  },

  resultsList: {
    paddingBottom: 30,
  },

  /* ---------------------------------------------------------
     PLACE ROW
  --------------------------------------------------------- */

  placeRow: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  placeIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#EAF4F3",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  placeInfo: {
    flex: 1,

    paddingRight: 8,
  },

  placeTitle: {
    fontFamily: appFonts.bold,

    fontSize: fontSizes.FONT13,

    color: "#172525",

    marginBottom: 3,
  },

  placeDescription: {
    fontFamily: appFonts.regular,

    fontSize: fontSizes.FONT11,

    lineHeight: 16,

    color: "#7B8787",
  },

  placeArrow: {
    width: 28,
    alignItems: "flex-end",
  },

  separator: {
    height: 1,

    backgroundColor: "#EDF1F1",

    marginLeft: 70,
  },

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

  loadingState: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingBottom: 100,
  },

  loadingIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 14,
  },

  loadingTitle: {
    fontFamily: appFonts.bold,

    fontSize: fontSizes.FONT14,

    color: "#172525",

    marginBottom: 4,
  },

  loadingSubtitle: {
    fontFamily: appFonts.regular,

    fontSize: fontSizes.FONT11,

    color: "#8B9797",
  },

  /* ---------------------------------------------------------
     EMPTY
  --------------------------------------------------------- */

  emptyState: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 40,
    paddingBottom: 100,
  },

  emptyIcon: {
    width: 66,
    height: 66,

    borderRadius: 22,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,
  },

  emptyTitle: {
    fontFamily: appFonts.bold,

    fontSize: fontSizes.FONT15,

    color: "#172525",

    marginBottom: 5,
  },

  emptySubtitle: {
    fontFamily: appFonts.regular,

    fontSize: fontSizes.FONT11,

    lineHeight: 17,

    textAlign: "center",

    color: "#899595",
  },

  /* ---------------------------------------------------------
     INITIAL
  --------------------------------------------------------- */

  initialState: {
    alignItems: "center",

    paddingHorizontal: 28,
    paddingTop: 60,
  },

  initialIcon: {
    width: 76,
    height: 76,

    borderRadius: 26,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 17,
  },

  initialTitle: {
    fontFamily: appFonts.bold,

    fontSize: fontSizes.FONT16,

    color: "#172525",

    marginBottom: 6,
  },

  initialSubtitle: {
    fontFamily: appFonts.regular,

    fontSize: fontSizes.FONT12,

    lineHeight: 18,

    textAlign: "center",

    color: "#899595",

    maxWidth: 280,
  },

  /* ---------------------------------------------------------
     TIP
  --------------------------------------------------------- */

  tipCard: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 24,

    padding: 12,

    backgroundColor: "#FFF9EA",

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#F5E8C8",

    width: "100%",
  },

  tipIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor: "#FFF1C9",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  tipText: {
    flex: 1,

    fontFamily: appFonts.regular,

    fontSize: 10,

    lineHeight: 15,

    color: "#79683F",
  },
});
