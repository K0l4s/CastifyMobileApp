import React, {useState} from 'react';
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
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootState} from '../../redux/store';
import {launchImageLibrary} from 'react-native-image-picker';
import UserService from '../../services/userService';
import {updateAvatar, updateInformation} from '../../redux/reducer/authSlice';
import {TextInput} from 'react-native-paper';
import Toast from 'react-native-toast-message';

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

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [middleName, setMiddleName] = useState(user?.middleName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [birthday, setBirthday] = useState(
    user?.birthday ? new Date(user.birthday) : new Date(),
  );
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [province, setProvince] = useState(user?.provinces || '');
  const [district, setDistrict] = useState(user?.districts || '');
  const [ward, setWard] = useState(user?.wards ?? '');
  const [hamlet, setHamlet] = useState(user?.hamlet ?? '');

  const [loading, setLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // reset form when modal is closed
  const resetForm = () => {
    setFirstName(user?.firstName || '');
    setMiddleName(user?.middleName || '');
    setLastName(user?.lastName || '');
    setBirthday(user?.birthday ? new Date(user.birthday) : new Date());
    setAddress(user?.address || '');
    setPhone(user?.phone || '');
    setAvatar(user?.avatarUrl || '');
    setAvatarFile(null);
    setProvince(user?.provinces || '');
    setDistrict(user?.districts || '');
    setWard(user?.wards ?? '');
    setHamlet(user?.hamlet ?? '');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update avatar if a new one is selected
      if (avatarFile) {
        const avatarResponse = await UserService.changeAvatar(avatarFile);
        dispatch(updateAvatar(avatarResponse.data.avatarUrl));
      }
      
      const birthdayLocalDateTime = birthday.toISOString().replace('Z', '');

      // Prepare updated user information
      const updatedUser = {
        firstName,
        middleName,
        lastName,
        birthday: birthdayLocalDateTime,
        addressElement: address,
        phone,
        avatarUrl: avatar,
        coverUrl: user?.coverUrl || '',
        province: province,
        district: district,
        ward: ward,
        hamlet: hamlet,
      };

      // Update user information
      await UserService.updateUser(updatedUser);
      dispatch(updateInformation(updatedUser));

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
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

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false} onRequestClose={onClose}>
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
              <Image source={{uri: avatar}} style={styles.avatar} />
              <View style={styles.cameraIconContainer}>
                <Icon name="camera" size={24} color="#0e0e69" />
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            label="Middle Name"
            value={middleName}
            onChangeText={setMiddleName}
          />
          <TextInput
            style={styles.input}
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Pressable
            onPress={() => setOpenDatePicker(true)}
            style={{width: '100%'}}>
            <TextInput
              style={styles.input}
              label="Birthday"
              value={
                birthday ? birthday.toDateString() : 'Select your birthday'
              }
              editable={false}
            />
          </Pressable>
          <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={birthday || new Date()}
            onConfirm={date => {
              setOpenDatePicker(false);
              setBirthday(date);
            }}
            onCancel={() => setOpenDatePicker(false)}
          />
          <TextInput
            style={styles.input}
            label="Address"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            label="Phone"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            label="Province"
            value={province}
            onChangeText={setProvince}
          />
          <TextInput
            style={styles.input}
            label="District"
            value={district}
            onChangeText={setDistrict}
          />
          <TextInput
            style={styles.input}
            label="Ward"
            value={ward}
            onChangeText={setWard}
          />
          <TextInput
            style={styles.input}
            label="Hamlet"
            value={hamlet}
            onChangeText={setHamlet}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSave} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel} disabled={loading}>
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
    zIndex: 1000,
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
    color: 'red',
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
