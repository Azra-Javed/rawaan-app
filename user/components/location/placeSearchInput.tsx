import { PlaceResult, searchPlaces } from "@/utils/photon";
import { useRef, useState } from "react";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
} from "react-native";

type Props = {
  placeholder: string;
  onSelect: (place: PlaceResult) => void;
};

export default function PlaceSearchInput({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(text: string) {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const places = await searchPlaces(text);
      setResults(places);
    }, 500);
  }

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={handleChange}
        style={{ height: 38, fontSize: 16, color: "#000" }}
      />
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                setQuery(item.description);
                setResults([]);
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text numberOfLines={1}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
