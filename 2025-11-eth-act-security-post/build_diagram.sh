#!/bin/bash
set -eu

cd assets
pdflatex pipeline.tex
pdf2svg pipeline.pdf pipeline.svg
