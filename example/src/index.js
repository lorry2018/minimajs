import { Minima } from 'minimajs';
import path from 'path';

let minima = new Minima(path.join(__dirname, 'plugins'));
minima.start();