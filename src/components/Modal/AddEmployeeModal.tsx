// @ts-nocheck
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { useEffect, useState, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Select from "react-select";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchEmployees: () => void;
}

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: any;
}

interface ErrorsState {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  fetchEmployees,
}) => {
  const [cookies] = useCookies();
  
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);

  const initialFormState: FormState = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: null,
  };

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<ErrorsState>({});

  // Fetch roles when modal opens
  const fetchRolesHandler = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `role/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      const roles = data.roles;
      const modifiedRoles = roles.map((role: any) => ({
        value: role._id,
        label: role.role,
      }));
      setRoleOptions(modifiedRoles);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialFormState);
      setErrors({});
      fetchRolesHandler();
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRoleChange = (selectedOption: any) => {
    setForm({ ...form, role: selectedOption });
    setErrors({ ...errors, role: "" });
  };

  // Validation
  const validate = (): boolean => {
    const tempErrors: ErrorsState = {};

    if (!form.first_name.trim())
      tempErrors.first_name = "First name is required";
    if (!form.last_name.trim()) tempErrors.last_name = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) tempErrors.email = "Email is required";
    else if (!emailRegex.test(form.email))
      tempErrors.email = "Enter a valid email";

    const phoneRegex = /^[0-9]{10}$/;
    if (!form.phone.trim()) tempErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(form.phone))
      tempErrors.phone = "Phone number must be 10 digits";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!form.password.trim()) tempErrors.password = "Password is required";
    else if (!passwordRegex.test(form.password))
      tempErrors.password =
        "Password must be 8 character with uppercase, lowercase, number & special character";

    if (!form.role || !form.role.value) tempErrors.role = "Role is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const submitHandler = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const userData = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role.value,
        isSuper: false,
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}auth/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.access_token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Failed to create user");

      toast.success("Employee added successfully");
      fetchEmployees();
      onClose();

      setForm(initialFormState);
      setErrors({});
    } catch (error: any) {
      toast.error(error.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent className="rounded-xl">
        <ModalHeader>Add Employee</ModalHeader>
        <ModalCloseButton />

        <ModalBody className="space-y-4">
          <FormControl isInvalid={!!errors.first_name} isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
            />
            <FormErrorMessage>{errors.first_name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.last_name} isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Doe"
            />
            <FormErrorMessage>{errors.last_name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.phone} isRequired>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={10}
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>

            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Strong password"
              />

              <InputRightElement width="3rem">
                <Button
                  h="1.5rem"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                 {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                </Button>
              </InputRightElement>
            </InputGroup>

            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.role} isRequired>
            <FormLabel>Role</FormLabel>
            <Select
              value={form.role}
              options={roleOptions}
              onChange={handleRoleChange}
              placeholder={isLoadingRoles ? "Loading roles..." : "Select role"}
              isDisabled={isLoadingRoles}
              styles={{
                control: (provided: any) => ({
                  ...provided,
                  backgroundColor: "white",
                  borderColor: errors.role ? "#E53E3E" : "#d1d5db",
                  minHeight: "40px",
                  "&:hover": {
                    borderColor: errors.role ? "#E53E3E" : "#9ca3af",
                  },
                }),
                option: (provided: any, state: any) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#e5e7eb" : "white",
                  color: "#374151",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                }),
                placeholder: (provided: any) => ({
                  ...provided,
                  color: "#9ca3af",
                }),
                singleValue: (provided: any) => ({
                  ...provided,
                  color: "#374151",
                }),
                menu: (provided: any) => ({
                  ...provided,
                  zIndex: 9999,
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                }),
              }}
            />
            {errors.role && (
              <FormErrorMessage mt={1}>{errors.role}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
    
          <Button
            color="white"
            bg="#2563EB"
            _hover={{ bg: "#1D4ED8" }}
            onClick={submitHandler}
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Save"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddEmployeeModal;
