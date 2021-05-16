{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
    nativeBuildInputs = [ 
        pkgs.nodejs-15_x
    ];
}