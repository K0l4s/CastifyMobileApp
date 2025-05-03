import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../../redux/store';
import { launchImageLibrary } from 'react-native-image-picker';
import UserService from '../../services/userService';
import { updateAvatar, updateInformation } from '../../redux/reducer/authSlice';
import { TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { locationService } from '../../services/locationService';
import { Picker } from '@react-native-picker/picker';
import { updateUser } from '../../models/User';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  // console.log(user?.location)
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [middleName, setMiddleName] = useState(user?.middleName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [birthday, setBirthday] = useState(
    user?.birthday ? new Date(user.birthday) : new Date()
  );
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [province, setProvince] = useState(user?.location?.district?.city?.id || '');
  const [district, setDistrict] = useState(user?.location?.district?.id || '');
  const [ward, setWard] = useState(user?.location?.id || '');
  const [hamlet, setHamlet] = useState(user?.address || '');
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  useEffect(() => {
    if (user?.location?.district?.city?.id) {
      setProvince(user.location.district.city.id);
    }
    if (user?.location?.district?.id) {
      setDistrict(user.location.district.id);
    }
    if (user?.location?.id) {
      setWard(user.location.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await locationService.getProvinces();
      setProvincesList(res.data);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      // console.log("a");
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

  const resetForm = () => {
    setFirstName(user?.firstName || '');
    setMiddleName(user?.middleName || '');
    setLastName(user?.lastName || '');
    setBirthday(user?.birthday ? new Date(user.birthday) : new Date());
    setAddress(user?.address || '');
    setPhone(user?.phone || '');
    setAvatar(user?.avatarUrl || '');
    setAvatarFile(null);
    setProvince(user?.location?.district?.city?.id || '');
    setDistrict(user?.location?.district?.id || '');
    setWard(user?.location?.id || '');
    setHamlet(user?.address || '');
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      if (avatarFile) {
        const avatarResponse = await UserService.changeAvatar(avatarFile);
        dispatch(updateAvatar(avatarResponse.data.avatarUrl));
      }

      const birthdayLocalDateTime = birthday.toISOString().replace('Z', '');
      const wardId = ward;
      console.log(user)
      // console.log(ward)
      const updatedUser:updateUser = {
        firstName,
        middleName,
        lastName,
        birthday: birthdayLocalDateTime,
        wardId: wardId,
        ward: ward,
        district: district,
        provinces: province,
        phone: phone,
        addressElements: address,
      };

      await UserService.updateUser(updatedUser);
      dispatch(updateInformation(updatedUser));

      Toast.show({
        type: 'success',
        text1: 'Cập nhật thông tin thành công!',
        position: 'bottom',
        visibilityTime: 2000,
      });

      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setAvatar(selectedImage.uri || '');
        setAvatarFile({
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName,
        } as unknown as File);
      }
    });
  };

  const handleBack = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} disabled={loading}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleSelectImage}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
              <View style={styles.cameraIconContainer}>
                <Icon name="camera" size={24} color="#0e0e69" />
              </View>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.input} label="First Name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} label="Middle Name" value={middleName} onChangeText={setMiddleName} />
          <TextInput style={styles.input} label="Last Name" value={lastName} onChangeText={setLastName} />
          {/* <Pressable onPress={() => setOpenDatePicker(true)} style={{ width: '100%' }}>
            <TextInput
              style={styles.input}
              label="Birthday"
              value={birthday.toDateString()}
              editable={false}
            />
          </Pressable> */}
          {/* <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={birthday || new Date()}
            onConfirm={date => {
              setOpenDatePicker(false);
              setBirthday(date);
            }}
            onCancel={() => setOpenDatePicker(false)}
          />  */}
          <TextInput style={styles.input} label="Address" value={address} onChangeText={setAddress} />
          <TextInput style={styles.input} label="Phone" value={phone} onChangeText={setPhone} />

          <Text style={styles.pickerLabel}>Province</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={province} onValueChange={setProvince}>
              <Picker.Item label="Select Province" value="" />
              {provincesList.map(p => (
                <Picker.Item key={p.id} label={p.name} value={p.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.pickerLabel}>District</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={user?.location.district.id} onValueChange={setDistrict} enabled={!!province}>
              <Picker.Item label="Select District" value="" />
              {districtsList.map(d => (
                <Picker.Item key={d.id} label={d.name} value={d.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.pickerLabel}>Ward</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={ward} onValueChange={setWard} enabled={!!district}>
              <Picker.Item label="Select Ward" value="" />
              {wardsList.map(w => (
                <Picker.Item key={w.id} label={w.name} value={w.id} />
              ))}
            </Picker>
          </View>

          <TextInput style={styles.input} label="Hamlet" value={hamlet} onChangeText={setHamlet} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSave} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonCancel} onPress={handleBack} disabled={loading}>
              <Text style={styles.buttonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.7,
  },
  cameraIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  pickerLabel: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonSave: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonCancel: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonCancelText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default EditProfileModal;
