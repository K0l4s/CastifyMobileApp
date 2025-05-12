import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootParamList } from "../../type/navigationType";
import AuthenticateService from "../../services/authenticateService";
import { locationService } from "../../services/locationService";
import { Picker } from "@react-native-picker/picker";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose }: RegisterModalProps) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootParamList, "Main">>();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    repeatEmail: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    birthday: new Date(),
    addressElements: "",
    username: "",
    wardId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await locationService.getProvinces();
      setProvincesList(res.data);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      console.log("a");
      const fetchDistricts = async () => {
        const res = await locationService.getDistricts(province);
        setDistrictsList(res.data);
        if (!res.data.find((d: any) => d.id === district)) {
          setDistrict('');
          setWard('');
          setWardsList([]);
        }
      };
      fetchDistricts();
    } else {
      setDistrictsList([]);
      setDistrict('');
      setWard('');
      setWardsList([]);
    }
  }, [province]);

  useEffect(() => {
    if (district) {
      const fetchWards = async () => {
        const res = await locationService.getWards(district);
        setWardsList(res.data);
        if (!res.data.find((w: any) => w.id === ward)) {
          setWard('');
        }
      };
      fetchWards();
    } else {
      setWardsList([]);
      setWard('');
    }
  }, [district]);
  const handleInputChange = (name: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    setErrorMessage("");
    if (!formData.email || !formData.repeatEmail || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("Invalid email format.");
      return;
    }
    if (formData.email !== formData.repeatEmail) {
      setErrorMessage("Emails do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setErrorMessage("");
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const localDateTime = new Date(formData.birthday.getTime() - formData.birthday.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0] + "T00:00:00";

      await AuthenticateService.register({ ...formData, birthday: localDateTime, appType: "CASTIFY", wardId: ward }, dispatch, navigation);
      onClose();
      // navigation.navigate("Verify", { email: formData.email });
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>

          {step === 1 ? (
            <>
              <Text style={styles.title}>Create an Account - Step 1</Text>
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" value={formData.email} onChangeText={(text) => handleInputChange("email", text)} />
              <TextInput style={styles.input} placeholder="Repeat Email" placeholderTextColor="#aaa" value={formData.repeatEmail} onChangeText={(text) => handleInputChange("repeatEmail", text)} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa" secureTextEntry={!showPassword} value={formData.password} onChangeText={(text) => handleInputChange("password", text)} />
              <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaa" secureTextEntry={!showRetypePassword} value={formData.confirmPassword} onChangeText={(text) => handleInputChange("confirmPassword", text)} />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : step === 2 ? (
            <>
              <Text style={styles.title}>Create an Account - Step 2</Text>
              <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#aaa" value={formData.firstName} onChangeText={(text) => handleInputChange("firstName", text)} />
              <TextInput style={styles.input} placeholder="Middle Name" placeholderTextColor="#aaa" value={formData.middleName} onChangeText={(text) => handleInputChange("middleName", text)} />
              <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#aaa" value={formData.lastName} onChangeText={(text) => handleInputChange("lastName", text)} />
              {/* DatePicker để chọn ngày sinh */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{formData.birthday.toISOString().split("T")[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.birthday}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      handleInputChange("birthday", selectedDate);
                    }
                  }}
                />
              )}
              <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#aaa" value={formData.phone} onChangeText={(text) => handleInputChange("phone", text)} />
              <TextInput style={styles.input} placeholder="Nickname" placeholderTextColor="#aaa" value={formData.username} onChangeText={(text) => handleInputChange("username", text)} />
              <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput style={[styles.input, { color: 'black' }]}  placeholder="Address" placeholderTextColor="#aaa" value={formData.addressElements} onChangeText={(text) => handleInputChange("addressElements", text)} />
              <Text style={styles.pickerLabel}>Province</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  onValueChange={setProvince}
                  style={{ color: 'black' }}
                >
                  <Picker.Item label="Select Province" value="" />
                  {provincesList.map(p => (
                    <Picker.Item key={p.id} label={p.name} value={p.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>District</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  onValueChange={setDistrict} 
                  enabled={!!province}
                  style={{ color: 'black' }}
                >
                  <Picker.Item label="Select District" value="" />
                  {districtsList.map(d => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>Ward</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  onValueChange={setWard} 
                  enabled={!!district}
                  style={{ color: 'black' }}
                >
                  <Picker.Item label="Select Ward" value="" />
                  {wardsList.map(w => (
                    <Picker.Item key={w.id} label={w.name} value={w.id} />
                  ))}
                </Picker>
              </View>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modal: { width: "90%", padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  closeButton: { position: "absolute", top: 10, right: 10, padding: 5 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", color: 'black', height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, paddingHorizontal: 10, marginBottom: 15, justifyContent: "center" },
  button: { width: "100%", backgroundColor: "#4f46e5", paddingVertical: 12, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 }, pickerLabel: {
    width: '100%',
    fontWeight: 'bold',
    marginTop: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
});

export default RegisterModal;
