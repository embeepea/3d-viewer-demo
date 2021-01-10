const Settings = {
  'lights': {
    'Ambient': [
      {'color': 0xcccccc, 'intensity': 0.3}
    ],
    'directional': [
      {
        'position': {'x': 500, 'y': 500, 'z': 200},
        'color': 0xffffff,
        'intensity': 0.4
      },
      {
        'position': {'x': -200, 'y': 500, 'z': 500},
        'color': 0xffffff,
        'intensity': 0.4
      }
    ]
  },
  'fieldOfView': 45.0,
  'nearPlane': 1.0,
  'farPlane': 5000,
  'walkSpeed': 13,
};

export {Settings};
