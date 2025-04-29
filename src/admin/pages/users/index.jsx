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

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedUserForDiscount, setSelectedUserForDiscount] = useState(null);
  const [selectedDiscountStatus, setSelectedDiscountStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const columns = [
    { field: "email", headerName: "Correo Electrónico", flex: 1 },
    { field: "username", headerName: "Nombre de Usuario", flex: 1 },
    { field: "red", headerName: "Red Social", flex: 0.7 },
    {
      field: 'createdAt',
      headerName: 'Fecha de Registro',
      flex: 1,
      valueFormatter: (params) => {
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
      field: "discountStatus",
      headerName: "Descuento",
      flex: 0.7,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color={params.row.discountStatus ? "success" : "warning"}
          size="small"
          onClick={() => {
            setSelectedUserForDiscount(params.row.id);
            setSelectedDiscountStatus(!params.row.discountStatus);
            setOpenConfirmDialog(true);
          }}
        >
          {params.row.discountStatus ? "✔️" : "❌"}
          {/* {params.row.discountStatus ? "✔️ Recibido" : "❌ No recibido"} */}
        </Button>
      )
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
  
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: selectedUser.id,
          email: emailInput.trim(),
        }),
      });
    
      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }
  
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
      toast.error('Error al actualizar usuario');
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

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      setUsers((prev) => prev.filter((u) => u.id !== uid));

      toast.success('Usuario eliminado correctamente');
      return { success: true };

    } catch (error) {
      toast.error('Error al eliminar usuario');
      return { success: false, error: error.message };
    }
  };

  {/* MÉTODO PARA MANEJAR DESCUENTO */ }
  const updateDiscountStatus = async (uid, discountStatus) => {
    try {
      const response = await fetch('/api/discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, discountStatus })
      });
    
      if (!response.ok) {
        throw new Error('Error al actualizar descuento');
      }
  
      setUsers((prev) =>
        prev.map((u) =>
          u.id === uid ? { ...u, discountStatus: discountStatus } : u
        )
      );
  
      toast.success('Estado del descuento actualizado correctamente');
      return { success: true };
    } catch (err) {
      toast.error('Error al actualizar el estado del descuento');
      return { success: false, error: err.message };
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
      {/* TOAST */}
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {/* Botón añadir usuario */}
        <Button
          variant="contained"
          onClick={() => setOpenAddDialog(true)}
          sx={{
            backgroundColor: '#5CB3FF',
            color: "#000",
            '&:hover': { backgroundColor: '#4CA1E0' },
          }}
        >
          Añadir usuario
        </Button>
      </Box>

      {/* DATA TABLE */}
      <Box sx={{ height: "75vh" }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          disableColumnMenu
          localeText={{
            noRowsLabel: "No hay registros",
            loadingOverlayLabel: "Cargando usuarios...",
            toolbarDensity: "Densidad",
            toolbarDensityLabel: "Densidad",
            toolbarDensityCompact: "Compacta",
            toolbarDensityStandard: "Estándar",
            toolbarDensityComfortable: "Cómoda",
            toolbarColumns: "Columnas",
            toolbarColumnsLabel: "Seleccionar columnas",
            toolbarFilters: "Filtros",
            toolbarFiltersLabel: "Mostrar filtros",
            toolbarExport: "Exportar",
            toolbarExportLabel: "Exportar",

            filterPanelColumns: "Columna",
            filterPanelOperators: "Operador",
            filterPanelInputLabel: "Valor",
            filterPanelInputPlaceholder: "Filtrar valor",
            columnsPanelTextFieldLabel: "Buscar columna",
            columnsPanelTextFieldPlaceholder: "Título de la columna",
            toolbarExportCSV: "Descargar como CSV",
            toolbarExportPrint: "Imprimir",

            filterOperatorContains: "Contiene",
            filterOperatorEquals: "Igual a",
            filterOperatorStartsWith: "Empieza con",
            filterOperatorEndsWith: "Termina con",
            filterOperatorIs: "Es",
            filterOperatorNot: "No es",
            filterOperatorAfter: "Después de",
            filterOperatorOnOrAfter: "En o después de",
            filterOperatorBefore: "Antes de",
            filterOperatorOnOrBefore: "En o antes de",
            filterOperatorIsEmpty: "Está vacío",
            filterOperatorIsNotEmpty: "No está vacío",
            filterOperatorIsAnyOf: "Es alguno de",

            MuiTablePagination: {
              labelRowsPerPage: 'Filas por página:',
              labelDisplayedRows: ({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`,
            },
            footerRowSelected: (count) =>
              count === 1 ? '1 fila seleccionada' : `${count} filas seleccionadas`,
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
            '@media print': {
              '.MuiDataGrid-toolbarContainer': {
                display: 'none',
              },
            },
          }}
        />
      </Box>


      {/* Añadir Usuario */}
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
            <Typography variant="body2" gutterBottom>O registra con:</Typography>
            <Box display="flex" gap={2} justifyContent="center" mt={1}>
              {/* Google */}
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

              {/* Facebook */}
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

      {/* Editar Usuario */}
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
              setOpenDialog(false);
            }}
            variant="contained"
            color="primary"
            disabled={isEditing}
          >
            {isEditing ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Borrar Usuario */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro que deseas eliminar este usuario?</DialogContentText>
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

      {/* Confirmar cambio de descuento */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirmar cambio de descuento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas {selectedDiscountStatus ? "marcar como recibido" : "marcar como no recibido"} el descuento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button
            color="primary"
            disabled={isUpdating}
            onClick={async () => {
              if (!selectedUserForDiscount) return;

              setIsUpdating(true);
              const result = await updateDiscountStatus(selectedUserForDiscount, selectedDiscountStatus);
              setIsUpdating(false);

              if (result.success) {
                setOpenConfirmDialog(false);
              }
            }}
          >
            {isUpdating ? 'Actualizando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>

  );
};

export default Users;
