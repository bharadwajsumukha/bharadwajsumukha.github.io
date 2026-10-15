#!/usr/bin/env bash
# Optional helper to cache official IllustrisTNG & EAGLE media locally inside assets/simulations/
set -e
mkdir -p assets/simulations
echo "Downloading IllustrisTNG TNG100 Halo #194946 CGM feedback evolution movie (Zinger et al. 2020)..."
curl -L "https://www.tng-project.org/movies/tng/tng100_sb0_194946_zinger20.mp4" -o assets/simulations/tng100_sb0_194946_zinger20.mp4
echo "Downloading TNG50 H-alpha & starlight z=2 composite (Pillepich & Nelson / TNG Collaboration)..."
curl -L "https://www.tng-project.org/static/tng/media/TNG50_galaxies_Halpha_starlight_z2_1k.jpg" -o assets/simulations/TNG50_galaxies_Halpha_starlight_z2_1k.jpg
echo "Done! Local simulation media saved to assets/simulations/"
