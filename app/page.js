'use client'
import { useState, useEffect, useCallback } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
}

export default function Home() {
  // State variables
  const [inventory, setInventory] = useState([]) // Full list of inventory items
  const [filteredInventory, setFilteredInventory] = useState([]) // Filtered inventory based on search
  const [open, setOpen] = useState(false) // Modal open/close state
  const [itemName, setItemName] = useState('') // State to manage the new item name
  const [searchTerm, setSearchTerm] = useState('') // Search input state

  // Fetch and update inventory list from Firestore
  const updateInventory = useCallback(async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }))
      setInventory(inventoryList)
      filterItems(searchTerm, inventoryList) // Filter items after fetching
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }, [searchTerm])

  // Add an item to the inventory
  const addItem = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        // Update the quantity of the existing item
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
      } else {
        // Add a new item
        await setDoc(docRef, { quantity: 1 })
      }

      await updateInventory() // Refresh the inventory list
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }, [updateInventory])

  // Remove an item from the inventory
  const removeItem = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
        }
      }

      await updateInventory() // Refresh the inventory list
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }, [updateInventory])

  // Filter inventory items based on search term
  const filterItems = useCallback((search, items) => {
    const filteredItems = items.filter(item => {
      return item.name.toLowerCase().includes(search.toLowerCase())
    })
    setFilteredInventory(filteredItems)
  }, [])

  useEffect(() => {
    updateInventory()
  }, [updateInventory])

  // Handle changes in the search input
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    filterItems(newSearchTerm, inventory) // Filter items on search input change
  }

  // Handle modal open and close
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={3}
      bgcolor="#e0f2f1" // Light green background
    >
      <Typography variant="h3" gutterBottom color="#004d40">
        Pantry Tracker
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ marginBottom: 2 }}
        size="large"
      >
        Add New Item
      </Button>

      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300, borderRadius: 2 }}
          size="small"
        />
      </Box>

      {/* Modal for adding a new item */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-item-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="add-item-modal" variant="h6" gutterBottom>
            Add New Item
          </Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            size="small"
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              addItem(itemName) // Add the item to the inventory
              setItemName('') // Clear the input field
              handleClose() // Close the modal
            }}
            fullWidth
          >
            Add
          </Button>
        </Box>
      </Modal>

      <Box
        width="100%"
        maxWidth="800px"
        bgcolor="white"
        borderRadius={2}
        boxShadow={3}
        overflow="hidden"
        mt={3}
      >
        <Box
          bgcolor="#004d40" // Dark green header
          color="white"
          padding={2}
        >
          <Typography variant="h5" align="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack spacing={2} padding={2} maxHeight="400px" overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#ffffff"
              borderRadius={1}
              padding={2}
              boxShadow={1}
            >
              <Typography variant="h6">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6">
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => addItem(name)} // Increment item quantity
                  size="small"
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)} // Decrement item quantity
                  size="small"
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
