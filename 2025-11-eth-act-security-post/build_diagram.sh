#!/bin/bash
set -eu

cd assets
pdflatex pipeline.tex
pdf2svg pipeline.pdf pipeline_no_bg.svg
sed 's|<svg \([^>]*\)>|<svg \1>\n<rect width="100%" height="100%" fill="white"/>|' pipeline_no_bg.svg > pipeline.svg
