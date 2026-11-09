// The otp documents, as codegen generates them from otp.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  SendSmsOtpDocument as SEND_SMS_OTP,
  SendWhatsappOtpDocument as SEND_WHATSAPP_OTP,
  VerifySmsOtpDocument as VERIFY_SMS_OTP,
  VerifyWhatsappOtpDocument as VERIFY_WHATSAPP_OTP,
} from '../gql/graphql.js';
