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
}

export default AuthenticateService;