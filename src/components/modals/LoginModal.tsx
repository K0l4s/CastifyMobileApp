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
import { useDispatch } from "react-redux";
import Toast from 'react-native-toast-message';
import AuthenticateService from "../../services/authenticateService";
import UserService from "../../services/userService";
import { setUser } from "../../redux/reducer/authSlice";
import RegisterModalStep1 from "./RegisterModal";

interface DefaultModalProps {
  trigger: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose, trigger }: DefaultModalProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [modalType, setModalType] = useState<"login" | "register">("login");

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await AuthenticateService.authenticate(formData, dispatch);
      const data = await UserService.getUserByToken();
      dispatch(setUser(data));
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

          {modalType === "login" ? (
            <>
              <Text style={styles.title}>Welcome Back</Text>
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
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
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="#aaa" />
                </TouchableOpacity>
              </View>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>

              <View style={styles.divider}>
                <Text style={styles.dividerText}>Or continue with</Text>
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Toast.show({ type: 'info', text1: "Google login coming soon!" })}
                >
                  <Icon name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Toast.show({ type: 'info', text1: "Facebook login coming soon!" })}
                >
                  <Icon name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => {
                setModalType("register");
              }}>
                <Text style={styles.link}>Don't have an account? Register here</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.link}>Forgot your password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <RegisterModalStep1 
              isOpen={true} 
              onClose={() => setModalType("login")} 
              // onNextStep={() => {}} 
              onSwitchToLogin={() => setModalType("login")} 
            />
          )}
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
    marginBottom: 10,
  },
  passwordInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'black'
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
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
    textAlign: "center",
  },
  divider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  dividerText: {
    textAlign: "center",
    color: "#888",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  socialButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  link: {
    marginTop: 10,
    color: "#4f46e5",
    textDecorationLine: "underline",
  },
});

export default LoginModal;
