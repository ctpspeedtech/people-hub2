import { Button, Input, Stack, Box, CloseButton, Text, Image } from "@chakra-ui/react";
import { useState, useEffect, type ChangeEvent } from "react";

import type { Employee as EmployeeType } from "../services/employeeService";
import { createEmployee, updateEmployee, uploadAvatar } from "../services/employeeService";
import { departmentService } from "../services/departmentService";

interface Props {
	onSuccess?: () => void;
	onClose?: () => void;
	employee?: EmployeeType | null;
	defaultOpen?: boolean;
	text: string;
	[key: string]: any;
}

export default function EmployeeModal({ onSuccess, onClose, employee = null, defaultOpen = false, ...props }: Props) {
	const [open, setOpen] = useState(!!defaultOpen);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState(() => ({
		email: employee?.email ?? "",
		full_name: employee?.full_name ?? "",
		phone: employee?.phone ?? "",
		position: employee?.position ?? "",
		level: employee?.level ?? "",
		role: employee?.role ?? "",
		birthday: employee?.birthday ?? "",
		address: employee?.address ?? "",
		education: employee?.education ?? "",
		note: employee?.note ?? "",
		department_id: employee?.departments?.id ?? "",
	}));
	const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	// sync when employee changes
	useEffect(() => {
		if (employee) {
			setForm((f) => ({
				...f,
				email: employee.email ?? "",
				full_name: employee.full_name ?? "",
				phone: employee.phone ?? "",
				position: employee.position ?? "",
				level: employee.level ?? "",
				role: employee.role ?? "",
				birthday: employee.birthday ?? "",
				address: employee.address ?? "",
				education: employee.education ?? "",
				note: employee.note ?? "",
				department_id: employee.departments?.id ?? "",
			}));
			setAvatarPreview(employee.avatar_url ?? null);
		}

		// load departments once
		( async () => {
			try {
				const d = await departmentService.getAll();
				setDepartments(d || []);
			} catch (err) {
				// ignore
			}
		})();
	}, [employee, defaultOpen]);

	const submit = async () => {
		setLoading(true);
		try {
			if (employee) {
				// if avatar file selected, upload first
				const payload: Record<string, any> = { ...form };
				// remove empty-string fields to avoid invalid DB input (e.g., date '')
				Object.keys(payload).forEach((k) => {
					if (payload[k] === "") delete payload[k];
				});
				if (avatarFile) {
					const res = await uploadAvatar(avatarFile, employee.id);
					payload.avatar_url = res.path;
				}
				await updateEmployee(employee.id, payload);
			} else {
				// create then optionally upload avatar
				const createPayload: Record<string, any> = { ...(form as any) };
				// sanitize create payload
				Object.keys(createPayload).forEach((k) => {
					if (createPayload[k] === "") delete createPayload[k];
				});
				createPayload.password = "123456";
				const created = await createEmployee(createPayload as any);
				if (avatarFile && created?.id) {
					const res = await uploadAvatar(avatarFile, created.id);
					await updateEmployee(created.id, { avatar_url: res.path });
				}
			}

			// after success: close and notify parent
			if (!employee) {
				setForm({
					email: "",
					full_name: "",
					phone: "",
					position: "",
					level: "",
					role: "",
					birthday: "",
					address: "",
					education: "",
					note: "",
					department_id: "",
				});
			}
			setAvatarFile(null);
			setAvatarPreview(null);
			setOpen(false);
			if (onSuccess) onSuccess();
			if (onClose) onClose();
		} catch (error: any) {
			alert("Error: " + (error?.message || "Could not save employee"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button size="sm" colorScheme="blue" {...props} onClick={() => setOpen(true)}>{props.text}</Button>
			{open && (
				<Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={40} onClick={() => setOpen(false)}>
					<Box bg="white" width={["95%", "600px"]} borderRadius="md" p={6} position="relative" onClick={(e) => e.stopPropagation()}>
						<CloseButton position="absolute" top={3} right={3} onClick={() => setOpen(false)} />
						<Box as="h3" fontSize="lg" fontWeight="semibold" mb={4}>{employee ? 'Edit Employee' : 'Add New Employee'}</Box>
						<Stack gap={4}>
							<Input
								placeholder="Email"
								value={form.email}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, email: e.target.value})}
							/>
							<Input
								placeholder="Full name"
								value={form.full_name}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, full_name: e.target.value})}
							/>
							<Box display="flex" gap={2}>
								<Input
									placeholder="Phone"
									value={form.phone}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, phone: e.target.value})}
								/>
								<Input
									placeholder="Position"
									value={form.position}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, position: e.target.value})}
								/>
							</Box>
							<Box display="flex" gap={2}>
								<Input
									placeholder="Level"
									value={form.level}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, level: e.target.value})}
								/>
								<Input
									type="date"
									placeholder="Birthday"
									value={form.birthday ?? ''}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, birthday: e.target.value})}
								/>
							</Box>
							{/* <Input
								placeholder="Role"
								value={form.role}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, role: e.target.value})}
							/> */}
							<Input
								placeholder="Address"
								value={form.address}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, address: e.target.value})}
							/>
							<Input
								placeholder="Education"
								value={form.education}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, education: e.target.value})}
							/>
							<Input
								placeholder="Note"
								value={form.note}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, note: e.target.value})}
							/>
							<Box>
								<Text fontSize="sm" mb={2}>Department</Text>
								<select value={form.department_id} onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({...form, department_id: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
									<option value="">-- Select department --</option>
									{departments.map(d => (
										<option key={d.id} value={d.id}>{d.name}</option>
									))}
								</select>
							</Box>
							<Box>
								<Text fontSize="sm" mb={2}>Avatar</Text>
								{avatarPreview ? (
									<Image src={avatarPreview} alt="avatar" boxSize="64px" objectFit="cover" borderRadius="md" mb={2} />
								) : (
									<Box width="64px" height="64px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center" mb={2}>{(form.full_name || form.email || '').charAt(0).toUpperCase()}</Box>
								)}
								<Input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => {
									const f = e.target.files?.[0] ?? null;
									setAvatarFile(f);
									if (f) setAvatarPreview(URL.createObjectURL(f));
								}} />
							</Box>
						</Stack>

						<Box mt={6} display="flex" justifyContent="flex-end">
							<Button variant="outline" mr={3} onClick={() => { setOpen(false); if (onClose) onClose(); }}>Cancel</Button>
							<Button onClick={submit} loading={loading} colorScheme="blue">{employee ? 'Save' : 'Create'}</Button>
						</Box>
					</Box>
				</Box>
			)}
		</>
	);
}
