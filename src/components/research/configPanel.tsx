// src/components/ConfigPanel.tsx
import React, { useEffect, useState } from 'react';
import { getConfig, saveConfig, fetchOllamaModels } from '../../services/configService';
import type { AIConfig } from '../../services/db';