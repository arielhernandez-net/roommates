const express = require("express");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const request = require('request');

const port = 3000;
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/roommate', async (req, res) => {
  try {
    const randomUserResponse = await fetch('https://randomuser.me/api/');
    if (!randomUserResponse.ok) {
      throw new Error('Error al obtener datos de la API');
    }

    const randomUserData = await randomUserResponse.json();
    const randomUser = randomUserData.results[0];

    const newRoommate = {
      id: uuidv4(),
      nombre: randomUser.name.first + ' ' + randomUser.name.last,
      debe: 0,
      recibe: 0,
    };

    let roommatesData = JSON.parse(fs.readFileSync('roommates.json'));
    roommatesData.push(newRoommate);
    fs.writeFileSync('roommates.json', JSON.stringify(roommatesData));

    res.status(201).json({ message: 'Roommate agregado correctamente' });
    console.log('Roommate agregado correctamente');
  } catch (error) {
    console.error('Error al agregar compañero de habitación:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/roommates', (req, res) => {
  const roommatesData = JSON.parse(fs.readFileSync('roommates.json'));
  res.json({ roommates: roommatesData });
});

app.get('/gastos', (req, res) => {
  const gastosData = JSON.parse(fs.readFileSync('gastos.json'));
  res.json({ gastos: gastosData });
});

app.post('/gasto', async (req, res) => {
  const { id, roommate, descripcion, monto } = req.body;

  let gastosData = JSON.parse(fs.readFileSync('gastos.json'));
  const expenseIndex = gastosData.findIndex((gasto) => gasto.id === id);

  if (expenseIndex !== -1) {
    gastosData[expenseIndex] = {
      id,
      roommate,
      descripcion,
      monto,
    };
  } else {
    gastosData.push({
      id: uuidv4(),
      roommate,
      descripcion,
      monto,
    });
  }

  fs.writeFileSync('gastos.json', JSON.stringify(gastosData));
  res.status(200).json({ message: 'Gasto guardado con éxito' });
});

app.delete('/gasto', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID es requerido' });
    }

    let gastosData = JSON.parse(fs.readFileSync('gastos.json'));
    const newGastosData = gastosData.filter((gasto) => gasto.id !== id);

    if (newGastosData.length === gastosData.length) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    fs.writeFileSync('gastos.json', JSON.stringify(newGastosData));
    res.status(200).json({ message: 'Gasto eliminado con éxito' });
  } catch (error) {
    console.error("Error al eliminar el gasto:", error);
    res.status(500).json({ message: 'Error al eliminar el gasto' });
  }
});

app.put('/gasto', async (req, res) => {
  try {
    const { id } = req.query;
    const { roommate, descripcion, monto } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID es requerido' });
    }

    let gastosData = JSON.parse(fs.readFileSync('gastos.json'));
    const expenseIndex = gastosData.findIndex((gasto) => gasto.id === id);

    if (expenseIndex === -1) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    gastosData[expenseIndex] = {
      id,
      roommate,
      descripcion,
      monto,
    };

    fs.writeFileSync('gastos.json', JSON.stringify(gastosData));
    res.status(200).json({ message: 'Gasto actualizado con éxito' });
  } catch (error) {
    console.error("Error al actualizar el gasto:", error);
    res.status(500).json({ message: 'Error al actualizar el gasto' });
  }
});

app.listen(port, () => console.log(`Funcionando en puerto ${port}`));   