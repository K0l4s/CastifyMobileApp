import {axiosInstance} from '../utils/axiosInstance';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';
import {login} from '../redux/reducer/authSlice';
import {AppDispatch} from '../redux/store';

class AuthenticateService {
  static async authenticate(
    formData: {email: string; password: string},
    dispatch: AppDispatch,
  ) {
    try {
      Toast.show({type: 'info', text1: 'Logging in...'});

      const response = await axiosInstance.post(
        '/api/v1/auth/authenticate',
        formData,
      );

      if (response.status === 200) {
        const {access_token, refresh_token} = response.data;
        dispatch(login());

        // Lưu token vào Keychain
        await Keychain.setGenericPassword(
          'tokenData',
          JSON.stringify({access_token, refresh_token}),
        );

        Toast.show({type: 'success', text1: 'Login successful!'});
        return response.data;
      } else {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err.message);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'An error occurred.',
      });
      throw err;
    }
  }

  static async register(
    formData: {
      email: string;
      repeatEmail: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      phone: string;
      birthday: string;
      addressElements: string;
      username: string;
      isMobile: boolean;
    },
    dispatch: AppDispatch,
    navigation: any
  ) {
    try {
      Toast.show({ type: "info", text1: "Registering account..." });

      console.log("Sending register data:", JSON.stringify(formData));

      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        formData
      );

      console.log("Response:", response.status, response.data);

      if (response.status === 200 || response.status === 201) {
        Toast.show({ type: "success", text1: "Registration successful!" });

        // // Tự động đăng nhập sau khi đăng ký thành công
        // const loginData = {
        //   email: formData.email,
        //   password: formData.password,
        // };

        // return await AuthenticateService.authenticate(loginData, dispatch);
        navigation.navigate("Verify", { email: formData.email });
      } else {
        throw new Error("Registration failed");
      }
    } catch (err: any) {
      console.error("Register error:", err.message);
      console.log("Error response:", err.response?.data);
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "An error occurred.",
      });
      throw err;
    }
  }

  static async verifyAccount(token: string) {
    return await axiosInstance.post('/api/v1/auth/verify-email', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

export default AuthenticateService;