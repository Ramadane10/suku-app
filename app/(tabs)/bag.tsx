import { StyleSheet, Text, View } from "react-native";

//affiche un titre bag sur l'ecran ici au milieu
const BagScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BagScreen;