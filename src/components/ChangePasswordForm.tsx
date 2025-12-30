import {
  Box,
  Button,
  Input,
  Text,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";

type Props = {
  onSuccess?: () => void;
};

export default function ChangePasswordForm({ onSuccess }: Props) {
  const changePassword = useAuthStore((s) => s.changePassword);
  const loading = useAuthStore((s) => s.loading);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (password.length < 8) {
      setError("Mật khẩu phải ít nhất 8 ký tự");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    const ok = window.confirm(
      "Bạn có chắc chắn muốn đổi mật khẩu không?"
    );
    if (!ok) return;

    try {
      await changePassword(password);
      setPassword("");
      setConfirm("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Box maxW="400px">
      <Stack gap={4}>
        <Box>
          <Text mb={1}>Mật khẩu mới</Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        <Box>
          <Text mb={1}>Xác nhận mật khẩu</Text>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Box>

        {error && <Text color="red.500">{error}</Text>}

        <Button
          colorScheme="red"
          width="full"
          onClick={submit}
          loading={loading}
        >
          Đổi mật khẩu
        </Button>
      </Stack>
    </Box>
  );
}
