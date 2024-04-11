varying vec3 vVertexWorldPosition;
varying vec3 vVertexNormal;
varying vec4 vFragColor;
void main() {
    vVertexNormal = normalize(normalMatrix * normal);
    vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
// set gl_Position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}