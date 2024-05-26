function replaceMany(str: string, targets: string[], replacement: string): string {
    return targets.reduce((acc, target) => acc.replace(target, replacement), str)
}


