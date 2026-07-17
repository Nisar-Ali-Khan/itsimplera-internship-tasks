const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card py-16 px-6 text-center">
    {Icon && (
      <div className="h-12 w-12 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
        <Icon size={22} className="text-forest-500" />
      </div>
    )}
    <p className="font-display font-semibold text-lg mb-1.5">{title}</p>
    {description && <p className="text-sm text-inkmuted mb-5 max-w-sm mx-auto">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
