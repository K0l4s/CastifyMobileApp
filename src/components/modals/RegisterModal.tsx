import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootParamList } from "../../type/navigationType"; 

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModalStep1 = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList, "Verify">>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    retypePassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegisterStep1 = () => {
    setErrorMessage("");

    if (!formData.email || !formData.password || !formData.retypePassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setErrorMessage("Invalid email format.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.retypePassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onClose(); // Đóng modal
      navigation.navigate("Verify", { email: formData.email });
      // navigation.navigate('RegisterFinal');
    }, 1000);
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Create an Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="#aaa" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Retype Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showRetypePassword}
              value={formData.retypePassword}
              onChangeText={(text) => handleInputChange("retypePassword", text)}
            />
            <TouchableOpacity onPress={() => setShowRetypePassword(!showRetypePassword)} style={styles.eyeIcon}>
              <Icon name={showRetypePassword ? "eye-off" : "eye"} size={24} color="#aaa" />
            </TouchableOpacity>
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegisterStep1}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={styles.loginText}>Already have an account? Login instead</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: "black",
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  loginText: {
    color: "#4f46e5",
    marginTop: 10,
  },
});

export default RegisterModalStep1;
