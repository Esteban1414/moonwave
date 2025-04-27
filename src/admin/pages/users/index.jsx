import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FiTrash } from "react-icons/fi";
import EditIcon from '@mui/icons-material/Edit';

import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  auth,
  signInWithPopup,
  googleProvider,
  facebookProvider
} from "../../lib/firebase";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [users, setUsers] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailInput, setEmailInput] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGoogle, setIsAddingGoogle] = useState(false);
  const [isAddingFacebook, setIsAddingFacebook] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "email", headerName: "Correo Electrónico", flex: 1 },
    { field: "username", headerName: "Nombre de Usuario", flex: 1 },
    { field: "red", headerName: "Red Social", flex: 0.7 },
    // { field: "createdAt", headerName: "Fecha de Registro", flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Fecha de Registro',
      flex: 1,
      valueFormatter: (params) => {
        // Si es Timestamp de Firebase
        const date = params.value?.toDate
          ? params.value.toDate()
          : new Date(params.value);

        return date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }); // Formato: 21/04/2025
      }
    },

    {
      field: "actions",
      headerName: "Acciones",
      sortable: false,
      filterable: false,
      flex: 0.7,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>

          {/* BOTONES DE ACCIONES */}
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => { setUserToDelete(row.id); setOpenDeleteDialog(true); }}>
              <FiTrash />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton color="primary" onClick={() => updateDialog(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  {/* FETCH DE USUARIOS */ }
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);

        await new Promise(resolve => setTimeout(resolve, 500));

        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(userList);
      } catch (error) {
        toast.error("Error al cargar usuarios");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  {/* MÉTODO PARA AÑADIR USUARIO */ }
  const addUser = async () => {
    const email = newEmail.trim();
    const username = newUsername.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!email || !username) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Introduce un correo electrónico válido.");
      return;
    }

    if (!usernameRegex.test(username)) {
      toast.error("El nombre de usuario debe tener entre 3 y 20 caracteres, y solo puede contener letras, números y guiones bajos (_).");
      return;
    }

    const isDuplicate = users.some((u) => u.email === email);
    if (isDuplicate) {
      toast.error("Este correo ya está registrado.");
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          red: 'pagina',
        }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error('Error al añadir usuario');
      }

      setOpenAddDialog(false);
      setNewEmail("");
      setNewUsername("");

      if (resultData.success) {
        setUsers((prev) => [...prev, resultData.user]);
        toast.success("Usuario añadido exitosamente.");
      } else {
        toast.error("Este usuario ya está registrado.");
      }

    } catch (error) {
      toast.error('Error al añadir usuario');
    }
  };



  {/* DIALOG ACTUALIZAR USUARIO SOLO EL EMAIL*/ }
  const updateDialog = (user) => {
    setSelectedUser(user);
    setEmailInput(user.email || "");
    setOpenDialog(true);
  };

  {/* MÉTODO PARA ACTUALIZAR USUARIO SOLO EL EMAIL*/ }
  const updateUser = async () => {
    try {
      if (!selectedUser || !emailInput.trim()) return;

      const isDuplicate = users.some(
        (u) => u.email === emailInput.trim() && u.id !== selectedUser.id
      );
      if (isDuplicate) {
        toast.error("Este correo ya está registrado.");
        return;
      }

      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, { email: emailInput.trim() });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, email: emailInput.trim() } : u
        )
      );

      setOpenDialog(false);
      setSelectedUser(null);
      setEmailInput("");
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar usuario");
    }
  };

  {/* MÉTODO PARA BORRAR USUARIO */ }
  const deleteUser = async (uid) => {
    try {
      const response = await fetch(`/api/users?uid=${uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      setUsers((prev) => prev.filter((u) => u.id !== uid));

      toast.success('Usuario eliminado correctamente');
      return { success: true };

    } catch (error) {
      toast.error('Error al eliminar usuario');
      return { success: false, error: error.message };
    }
  };

  {/* MÉTODO PARA MANEJAR ERRORES */ }

  const getError = (error, provider = 'el proveedor') => {
    const code = error.code || error?.error?.code;
    const message = error.message || error?.error?.message;

    if (code === 'auth/popup-closed-by-user') {
      return 'Cierre de ventana: no se completó el proceso de autenticación.';
    }

    if (code === 'auth/user-cancelled' || (code === 400 && message?.includes('USER_CANCELLED'))) {
      return `Has cancelado el inicio de sesión con ${provider}.`;
    }

    if (code === 'auth/account-exists-with-different-credential') {
      return 'Este correo ya está registrado con otro proveedor (como Google o Facebook).';
    }
    return `Error al autenticar con ${provider}. Intenta nuevamente.`;
  };


  {/* SIGN IN CON GOOGLE */ }
  const addUserGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData = {
        id: user.uid,
        email: user.email,
        username: user.displayName,
        red: "google"
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const resultData = await response.json();

      if (resultData.success) {
        setUsers((prev) => [...prev, resultData.user]);
        toast.success("Usuario registrado exitosamente.");
      } else {
        toast.error("Este usuario ya está registrado.");
      }

      setOpenAddDialog(false);
    } catch (error) {
      toast.error(getError(error, 'Google'));
    }
  };


  {/* SIGN IN CON FACEBOOK */ }
  const addUserFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      const userData = {
        id: user.uid,
        email: user.email,
        username: user.displayName,
        red: "facebook"
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const resultData = await response.json();

      if (resultData.success) {
        setUsers((prev) => [...prev, resultData.user]);
        toast.success("Usuario registrado exitosamente.");
      } else {
        toast.error("Este usuario ya está registrado.");
      }

      setOpenAddDialog(false);
    } catch (error) {
      toast.error(getError(error, 'Facebook'));

    }

  };


  return (
    <Box sx={{ pt: "80px", pb: "20px", px: "20px" }}>

      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>

      {/* BOTON AZUL AÑADIR USUARIO */}
      <Button
        variant="contained"
        onClick={() => setOpenAddDialog(true)}
        sx={{ mb: 2, backgroundColor: '#5CB3FF', color: "#000", '&:hover': { backgroundColor: '#4CA1E0', } }}>
        Añadir usuario
      </Button>
      {/* DATA TABLE */}
      <Box sx={{ height: "75vh" }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          localeText={{
            noRowsLabel: "No hay registros",
            loadingOverlayLabel: "Cargando usuarios..."
          }}
          sx={{
            borderRadius: "12px",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#5CB3FF",
              color: "#000",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#5CB3FF",
              color: "#000",
            },
            "& .MuiTablePagination-root": {
              color: "#000",
            },
          }}
        />
      </Box>

      {/* DIALOG AÑADIR USUARIO */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Añadir nuevo usuario</DialogTitle>
        <DialogContent>

          <TextField
            label="Nombre de usuario"
            fullWidth
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            margin="normal"
          />

          <TextField
            label="Correo electrónico"
            fullWidth
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              O registra con:
            </Typography>

            {/* DIALOG REDES SOCIALES */}
            <Box display="flex" gap={2} justifyContent="center" mt={1}>

              {/* GOOGLE */}
              <Button
                variant="outlined"
                startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" width="20" />}
                onClick={async () => {
                  setIsAddingGoogle(true);
                  await addUserGoogle();
                  setIsAddingGoogle(false);
                  setOpenAddDialog(false);
                }}
                disabled={isAddingGoogle || isAdding || isAddingFacebook}
              >
                {isAddingGoogle ? 'Cargando...' : 'Google'}
              </Button>

              {/* FACEBOOK */}
              <Button
                variant="outlined"
                startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg" width="20" />}
                onClick={async () => {
                  setIsAddingFacebook(true);
                  await addUserFacebook();
                  setIsAddingFacebook(false);
                  setOpenAddDialog(false);
                }}
                disabled={isAddingFacebook || isAdding || isAddingGoogle}
              >
                {isAddingFacebook ? 'Cargando...' : 'Facebook'}
              </Button>

            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>

          <Button
            onClick={async () => {
              setIsAdding(true);
              await addUser();
              setIsAdding(false);
            }}
            variant="contained"
            color="primary"
            disabled={isAdding || isAddingGoogle || isAddingFacebook}
          >
            {isAdding ? 'Añadiendo...' : 'Añadir'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* DIALOG EDITAR USUARIO*/}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Correo electrónico"
            fullWidth
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={async () => {
              setIsEditing(true);
              await updateUser();
              setIsEditing(false);
              setOpenDialog(false); // solo si fue exitoso dentro de updateUser()
            }}
            variant="contained"
            color="primary"
            disabled={isEditing}
          >
            {isEditing ? 'Guardando...' : 'Guardar'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* DIALOG BORRAR USUARIO */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>

          <Button
            color="error"
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              const result = await deleteUser(userToDelete);
              setIsDeleting(false);
              if (result.success) {
                setOpenDeleteDialog(false);
              }
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>

        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default Users;
