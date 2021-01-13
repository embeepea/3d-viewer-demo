// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
  'walkSpeed': 0.1,
};

export {Settings};
