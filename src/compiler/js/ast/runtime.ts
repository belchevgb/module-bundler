(function() {
    const modules = new Map<string, (__exportedMembers: any) => any>();
    const exports = new Map<string, any>();
    const global: any = window;

    global.__addModule = (moduleId: string, module: (__exportedMembers: any) => any) => {
        modules.set(moduleId, module);
    };

    global.__internalRequire = (moduleId: string) => {
        if (exports.has(moduleId)) {
            return exports.get(moduleId);
        }

        const exportedMembers = modules.get(moduleId).call(null, {});
        exports.set(moduleId, exportedMembers);

        return exportedMembers;
    };
}());