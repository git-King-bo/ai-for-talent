function readStartupPayload() {
  return {
    module: 'source-map-startup-crash',
    timestamp: new Date().toISOString(),
  }
}

function unwrapPayload(payload) {
  return payload.missingField.deep.value
}

export function triggerSourceMapStartupCrash() {
  const payload = readStartupPayload()

  // Force a startup crash for validating production source-map resolution.
  return unwrapPayload(payload)
}
